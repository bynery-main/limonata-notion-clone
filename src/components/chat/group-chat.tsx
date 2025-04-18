import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/firebaseConfig";
import { useToast } from "@chakra-ui/react";
import { useSpace, useMembers } from "@ably/spaces/react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { XIcon, ArrowUpIcon, MessageSquare } from "lucide-react";
import ChatButton from "./chat-button";

interface GroupChatProps {
  workspaceId: string;
  userId: string;
  isChatVisible: boolean;
  setIsChatVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: number;
  isAI?: boolean;
}

interface ChatResponse {
  answer: string;
}

const LoadingDots = () => {
  return (
    <div className="flex space-x-1 items-center">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
    </div>
  );
};

const GroupChat: React.FC<GroupChatProps> = ({ workspaceId, userId, isChatVisible, setIsChatVisible }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceCharCount, setWorkspaceCharCount] = useState(0);
  const { space } = useSpace();
  const { self, others } = useMembers();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxCharCount = 200000;
  const isCharLimitReached = workspaceCharCount > maxCharCount;
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Fetch workspace character count
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!workspaceId) return;
      
      try {
        const workspaceRef = doc(db, 'workspaces', workspaceId);
        const workspaceSnap = await getDoc(workspaceRef);
        
        if (workspaceSnap.exists()) {
          setWorkspaceCharCount(workspaceSnap.data().charCount || 0);
        }
      } catch (error) {
        console.error('Error fetching workspace character count:', error);
      }
    };

    fetchWorkspaceData();
  }, [workspaceId]);

  // Set up Ably channel for group chat
  useEffect(() => {
    if (!space) return;

    const channelName = `workspace-${workspaceId}-chat`;
    
    // Access the underlying Ably client from the space
    const ably = space.client;
    const chatChannel = ably.channels.get(channelName);
    
    const handleMessage = (message: any) => {
      const chatMessage = message.data as ChatMessage;
      setMessages(prevMessages => [...prevMessages, chatMessage]);
      
      // Also save the message to Firestore (only if it's not an old message being replayed)
      // We'll handle batch saving elsewhere
    };

    chatChannel.subscribe('chat-message', handleMessage);
    
    // Load messages from Firestore instead of Ably history
    fetchMessagesFromFirestore();
    
    return () => {
      chatChannel.unsubscribe('chat-message', handleMessage);
    };
  }, [space, workspaceId]);

  // New function to fetch messages from Firestore
  const fetchMessagesFromFirestore = async () => {
    try {
      const messagesRef = collection(db, 'workspaces', workspaceId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const loadedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          text: data.text,
          sender: {
            id: data.sender.id,
            name: data.sender.name,
            avatar: data.sender.avatar
          },
          timestamp: data.timestamp.toMillis(),
          isAI: data.isAI || false
        });
      });
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error fetching messages from Firestore:', error);
    }
  };

  // Scroll to bottom whenever messages change or chat visibility changes
  useEffect(() => {
    if (isChatVisible && messagesEndRef.current) {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isLoading, isChatVisible]);

  // Check if message mentions @LemonGPT
  const hasLemonGPTMention = (text: string) => {
    return text.includes('@LemonGPT');
  };

  // Modify getAIResponse to save to Firestore
  const getAIResponse = async (query: string) => {
    if (!workspaceId || !userId || !space) return;
    
    setIsLoading(true);
    
    try {
      const functions = getFunctions(app);
      const chatWithWorkspace = httpsCallable<{ workspaceId: string, query: string }, ChatResponse>(
        functions, 
        'chatWithWorkspace',
        { timeout: 240000 }
      );
      
      // Extract the actual query by removing the @LemonGPT mention
      const actualQuery = query.replace('@LemonGPT', '').trim();
      
      const result = await chatWithWorkspace({ 
        workspaceId, 
        query: actualQuery 
      });
      
      // Create a message from LemonGPT
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: result.data.answer,
        sender: {
          id: 'lemon-gpt',
          name: 'LemonGPT',
          avatar: '/favicon.ico'
        },
        timestamp: Date.now(),
        isAI: true
      };
      
      // Save AI message to Firestore
      await addDoc(collection(db, 'workspaces', workspaceId, 'messages'), {
        text: aiMessage.text,
        sender: aiMessage.sender,
        timestamp: Timestamp.fromMillis(aiMessage.timestamp),
        isAI: true
      });
      
      // Publish the AI message to the channel
      const channelName = `workspace-${workspaceId}-chat`;
      const ably = space.client;
      const chatChannel = ably.channels.get(channelName);
      
      if (chatChannel) {
        chatChannel.publish('chat-message', aiMessage);
      } else {
        // If channel isn't ready yet, at least update local state
        setMessages(prev => [...prev, aiMessage]);
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from LemonGPT",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modify sendMessage to save to Firestore
  const sendMessage = async () => {
    if (!inputMessage.trim() || !space || !self) return;
    
    try {
      const channelName = `workspace-${workspaceId}-chat`;
      const ably = space.client;
      const chatChannel = ably.channels.get(channelName);
      
      // Create message object with proper avatar URL from self profileData
      const message: ChatMessage = {
        id: `${userId}-${Date.now()}`,
        text: inputMessage.trim(),
        sender: {
          id: userId,
          name: self.profileData?.username as string || 'Anonymous',
          avatar: self.profileData?.avatar as string || undefined
        },
        timestamp: Date.now()
      };
      
      console.log("Sending message with avatar:", message.sender.avatar);
      
      // Save message to Firestore
      await addDoc(collection(db, 'workspaces', workspaceId, 'messages'), {
        text: message.text,
        sender: message.sender,
        timestamp: Timestamp.fromMillis(message.timestamp)
      });
      
      // Publish message to channel
      await chatChannel.publish('chat-message', message);
      
      // Check if message mentions @LemonGPT
      if (hasLemonGPTMention(inputMessage)) {
        getAIResponse(inputMessage);
      }
      
      // Clear input
      setInputMessage("");
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const markdownStyles = {
    p: 'mb-2 font-light break-words',
    ul: 'mb-2 list-disc pl-6',
    ol: 'mb-2 list-decimal pl-6',
    li: 'mb-1 font-light break-words',
    h1: 'text-xl font-bold mt-3 mb-2 break-words',
    h2: 'text-lg font-bold mt-3 mb-2 break-words',
    h3: 'text-base font-bold mt-3 mb-2 break-words',
    h4: 'text-sm font-bold mt-3 mb-2 break-words',
    h5: 'text-xs font-bold mt-3 mb-2 break-words',
    h6: 'text-xs font-bold mt-3 mb-2 break-words',
    strong: 'font-bold',
    code: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm break-words',
    pre: 'bg-gray-100 rounded p-2 whitespace-pre-wrap mb-2',
  };

  const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    p: ({ children }) => <p className={markdownStyles.p}>{children}</p>,
    ul: ({ children }) => <ul className={markdownStyles.ul}>{children}</ul>,
    ol: ({ children }) => <ol className={markdownStyles.ol}>{children}</ol>,
    li: ({ children }) => <li className={markdownStyles.li}>{children}</li>,
    h1: ({ children }) => <h1 className={markdownStyles.h1}>{children}</h1>,
    h2: ({ children }) => <h2 className={markdownStyles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={markdownStyles.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={markdownStyles.h4}>{children}</h4>,
    h5: ({ children }) => <h5 className={markdownStyles.h5}>{children}</h5>,
    h6: ({ children }) => <h6 className={markdownStyles.h6}>{children}</h6>,
    strong: ({ children }) => <strong className={markdownStyles.strong}>{children}</strong>,
    code: (props) => {
      const { inline, className, children } = props as { inline?: boolean; className?: string; children: React.ReactNode };
      return !inline ? (
        <pre className={markdownStyles.pre}>
          <code className={className}>{children}</code>
        </pre>
      ) : (
        <code className={markdownStyles.code}>{children}</code>
      );
    },
  };

  const welcomeMessage = `
# Welcome to Group Chat!

This is a collaborative workspace chat where you can:

- Chat with teammates in real-time
- Mention @LemonGPT to get AI assistance
- Ask questions about your workspace

Try asking @LemonGPT about your project!

> **Remember**: Don't forget to sync your workspace if you've made changes! 
> This helps LemonGPT stay up-to-date with your content.
`;

  // Handle @ mentions
  const [mentionText, setMentionText] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputMessage(text);
    
    // Check for @ mentions
    const atIndex = text.lastIndexOf('@');
    if (atIndex !== -1 && atIndex === text.length - 1) {
      setMentionText("");
      setShowMentionSuggestions(true);
    } else if (atIndex !== -1 && atIndex > text.lastIndexOf(' ')) {
      setMentionText(text.substring(atIndex + 1));
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const completeMention = (name: string) => {
    const atIndex = inputMessage.lastIndexOf('@');
    if (atIndex !== -1) {
      const newText = inputMessage.substring(0, atIndex) + '@' + name;
      setInputMessage(newText);
      setShowMentionSuggestions(false);
      inputRef.current?.focus();
    }
  };

  // Handle Tab key for mention completion
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && showMentionSuggestions) {
      e.preventDefault();
      completeMention('LemonGPT');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === '@') {
      // Immediately show mention suggestions when @ is typed
      setShowMentionSuggestions(true);
      setMentionText("");
    }
  };

  // Credit cost display logic
  const [isCreditHovered, setCreditHovered] = useState(false);
  const creditCost = 5;
  const showCreditCost = inputMessage.includes('@LemonGPT');

  // Format messages to highlight @ mentions
  const formatMessageText = (message: string) => {
    // If no @ mentions, just return the message for ReactMarkdown to handle
    if (!message.includes('@')) {
      return (
        <ReactMarkdown components={components} className="text-sm">
          {message}
        </ReactMarkdown>
      );
    }
    
    // Simple regex to find @mentions - this won't handle all edge cases but works for basic highlighting
    const parts = message.split(/(@\w+)/g);
    
    return (
      <div className="text-sm whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.startsWith('@')) {
            return (
              <span 
                key={`mention-${index}`}
                className="bg-yellow-400  text-transparent bg-clip-text font-semibold"
              >
                {part}
              </span>
            );
          } else {
            return (
              <ReactMarkdown key={`text-${index}`} components={components}>
                {part}
              </ReactMarkdown>
            );
          }
        })}
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isChatVisible ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md overflow-hidden bg-background/70 backdrop-blur-md md:w-[400px] shadow-2xl rounded-l-2xl"
        style={{ display: isChatVisible ? 'flex' : 'none' }}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center justify-between border-b border-background/10 bg-background/50 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#C66EC5] to-[#FC608D] p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-medium">Workspace Chat</div>
                <div className="text-xs text-muted-foreground">
                  {others.length + 1} online
                </div>
              </div>
            </div>
            <Button onClick={toggleChat} variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {showWelcomeMessage && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 text-sm border border-purple-100">
                <ReactMarkdown components={components}>
                  {welcomeMessage}
                </ReactMarkdown>
                <Button
                  onClick={() => setShowWelcomeMessage(false)}
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-full text-xs px-3 hover:bg-purple-50"
                >
                  Dismiss
                </Button>
              </div>
            )}
            
            {isCharLimitReached && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 p-3 rounded-lg shadow-lg mb-4"
              >
                <p className="text-sm text-red-800 font-medium">Character limit exceeded</p>
                <p className="text-xs text-red-700 mt-1">
                  Your workspace has {workspaceCharCount.toLocaleString()} characters, exceeding the limit of {maxCharCount.toLocaleString()}. 
                  Some features may be limited until you reduce content.
                </p>
              </motion.div>
            )}
            
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender.id === userId;
                const isAI = message.isAI;
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${
                      isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8 border">
                        {message.sender.avatar ? (
                          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                        ) : (
                          <AvatarFallback>
                            {message.sender.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[75%] rounded-2xl p-3 text-sm shadow 
                      ${isCurrentUser 
                        ? 'bg-gradient-to-r from-[#C66EC5] to-[#FC608D] text-white' 
                        : isAI 
                          ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200' 
                          : 'bg-muted/20 backdrop-blur-sm'
                      }`} 
                      style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                    >
                      {!isCurrentUser && !isAI && (
                        <div className="font-medium text-xs mb-1">{message.sender.name}</div>
                      )}
                      
                      {/* Message content with formatted mentions */}
                      {formatMessageText(message.text)}
                      
                      <div className="text-xs opacity-50 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    {isCurrentUser && (
                      <Avatar className="h-8 w-8 border">
                        {message.sender.avatar ? (
                          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                        ) : (
                          <AvatarFallback>
                            {message.sender.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </div>
                );
              })}
              
              {isLoading && (
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src="/favicon.ico" alt="LemonGPT" />
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl p-3 text-sm shadow bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200" 
                    style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
                    <LoadingDots />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t border-background/10 bg-background/70 px-4 py-3 backdrop-blur-sm">
            <div className="relative">
              {showMentionSuggestions && (
                <div className="absolute bottom-full mb-2 bg-white rounded-md shadow-lg border p-2 w-fit">
                  <div 
                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm flex items-center"
                    onClick={() => completeMention('LemonGPT')}
                  >
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src="/favicon.ico" alt="LemonGPT" />
                      <AvatarFallback>LG</AvatarFallback>
                    </Avatar>
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text font-semibold">LemonGPT</span>
                  </div>
                  {others.map(member => (
                    <div 
                      key={member.connectionId}
                      className="px-3 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm flex items-center"
                      onClick={() => completeMention((member.profileData?.username as string) || 'User')}
                    >
                      <Avatar className="h-5 w-5 mr-2">
                        {(member.profileData?.avatar as string) ? (
                          <AvatarImage src={member.profileData?.avatar as string} alt={member.profileData?.username as string} />
                        ) : (
                          <AvatarFallback>
                            {((member.profileData?.username as string) || 'User').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{member.profileData?.username as string}</span>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                ref={inputRef}
                placeholder="Type a message..."
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="min-h-[48px] w-full rounded-2xl resize-none p-4 pr-16 shadow-md shadow-gray-300 shadow-opacity-50 shadow-inset backdrop-blur-sm border-transparent outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-[0_0_0_2px_rgba(198,110,197,0.3),0_0_0_4px_rgba(252,96,141,0.2)]"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-gradient-to-r from-[#C66EC5] to-[#FC608D] hover:from-[#d67ad5] hover:to-[#fd7599] text-white"
                onMouseEnter={() => setCreditHovered(true)}
                onMouseLeave={() => setCreditHovered(false)}
              >
                {showCreditCost ? (
                  <motion.div className="relative">
                    <motion.div
                      animate={{ x: isCreditHovered ? -20 : 0, opacity: isCreditHovered ? 0 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: isCreditHovered ? 0 : 20, opacity: isCreditHovered ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {creditCost}
                    </motion.div>
                  </motion.div>
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      
      <ChatButton toggleChat={toggleChat} isChatVisible={isChatVisible} />
    </>
  );
};

export default GroupChat; 