"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@chakra-ui/react";
import NoCreditsModal from "../subscribe/no-credits-modal";
import { motion, AnimatePresence } from "framer-motion";
import SyncWorkspaceButton from "../sync-workspaces/sync-workspaces-button";
import CostButton from "../ai-tools/cost-button";
import ChatButton from "./chat-button";

interface ChatComponentProps {
  workspaceId: string;
  userId: string;
  isChatVisible: boolean;
  setIsChatVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ChatResponse {
  answer: string;
}

interface CreditUsageResult {
  success: boolean;
  message: string;
  remainingCredits: number;
}
interface SyncWorkspaceButtonProps {
  workspaceId: string | null;
  onSyncComplete?: () => void;
  className?: string;
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

const ChatComponent: React.FC<ChatComponentProps> = ({ workspaceId, userId, isChatVisible, setIsChatVisible }) => {
  const [messages, setMessages] = useState<{ type: string, content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState(0);
  const [creditCost] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSyncReminder, setShowSyncReminder] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <pre className={markdownStyles.pre}>
          <code className={className}>{children}</code>
        </pre>
      ) : (
        <code className={markdownStyles.code}>{children}</code>
      );
    },
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const introDescription = `
  Welcome to LemonGPT! I&apos;m your AI-powered assistant with knowledge of your entire workspace.
  
  I can help you:

  • Explain concepts and ideas

  • Compile and summarize information

  • Answer questions about your projects
  
  • Provide guidance and tutorials
  
  Feel free to ask me anything about your workspace or any topic you&apos;re working on!
  `;
  
  const handleSyncComplete = () => {
    setShowSyncReminder(false);
  };
  const handleSend = async () => {
    if (inputMessage.trim() && workspaceId) {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const newMessage = inputMessage.trim();
      setMessages([...messages, { type: 'user', content: newMessage }]);
      setInputMessage("");
      setIsLoading(true);

      const functions = getFunctions(app);
      const chatWithWorkspace = httpsCallable<{ workspaceId: string, query: string }, ChatResponse>(functions, 'chatWithWorkspace');
      const creditValidation = httpsCallable<{ uid: string, cost: number }, CreditUsageResult>(functions, 'useCredits');

      try {
        const creditUsageResult = await creditValidation({ uid: userId, cost: creditCost });

        console.log("Credit usage result:", creditUsageResult.data);

        if (!creditUsageResult.data.success) {
          setRemainingCredits(creditUsageResult.data.remainingCredits);
          setShowCreditModal(true);
          setIsLoading(false);
          return;
        }

        console.log("Sending query to chatWithWorkspace:", { workspaceId, query: newMessage });
        const result = await chatWithWorkspace({ workspaceId, query: newMessage });
        const answer = result.data.answer;
        setMessages(prevMessages => [...prevMessages, { type: 'assistant', content: answer }]);

        toast({
          title: "Success",
          description: "Message sent successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error during chatWithWorkspace:", error);
        toast({
          title: "Error",
          description: "An error occurred while sending your message",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
<>
  <AnimatePresence>
    {isChatVisible ? (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md overflow-hidden bg-background/60 backdrop-blur-sm md:w-[400px] shadow-2xl"
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center justify-between border-b border-background/10 bg-background/40 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src="/favicon.ico" alt="LemonGPT" />
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
              <div className="text-sm font-medium">LemonGPT</div>
            </div>
            <Button onClick={toggleChat} className="bg-white p-2 hover:bg-black">
              <XIcon className="h-5 w-5 text-black hover:text-white" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="grid gap-4 p-4">

                  {showSyncReminder && workspaceId && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-100 p-3 rounded-lg shadow-lg"
                    >
                      <p className="text-sm text-gray-800 mb-2">Don&apos;t forget to sync your workspaces!</p>
                      <SyncWorkspaceButton
                        workspaceId={workspaceId}
                        className="w-full"
                        onSyncComplete={handleSyncComplete}
                      />
                    </motion.div>
                  )}
              {showIntro && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-blue-100 p-3 rounded-lg shadow-md"
                >
                  <ReactMarkdown className={"text-sm"} components={components}>
                    {introDescription}
                  </ReactMarkdown>
                  <Button onClick={() => setShowIntro(false)} className="mt-2 bg-blue-500 text-white hover:bg-blue-600">
                    Got it!
                  </Button>
                </motion.div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                  {message.type === 'assistant' && (
                    <Avatar className="h-8 w-8 border">
                    <AvatarImage src="/favicon.ico" alt="LemonGPT" />
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  )}
                  <div className={`rounded-lg p-3 text-sm shadow ${message.type === 'user' ? 'bg-primary/80 backdrop-blur-sm text-primary-foreground' : 'bg-muted/20 backdrop-blur-sm'}`} style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
                    <ReactMarkdown components={components}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                      <AvatarFallback>YO</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src="/favicon.ico" alt="LemonGPT" />
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 text-sm shadow bg-muted/20 backdrop-blur-sm" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
                    <LoadingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="border-t border-background/10 bg-background/50 px-4 py-3 backdrop-blur-sm">
            <div className="relative flex">
              <Textarea
                placeholder="Type your message..."
                name="message"
                id="message"
                rows={1}
                className="min-h-[48px] w-full rounded-2xl resize-none p-4 pr-16 shadow-sm bg-background/50 backdrop-blur-sm"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
                <Button
                onClick={handleSend}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary/80 hover:bg-primary/90"
              >
                <motion.div className="relative" whileHover="hover">
                  <motion.div
                    variants={{
                      hover: { x: -20, opacity: 0 }
                    }}
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ x: 20, opacity: 0 }}
                    variants={{
                      hover: { x: 0, opacity: 1 }
                    }}
                  >
                    {creditCost}
                  </motion.div>
                </motion.div>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      ) : (
        <ChatButton toggleChat={toggleChat} isChatVisible={isChatVisible} />
      )}
    </AnimatePresence>

  {showCreditModal && (
    <NoCreditsModal
      remainingCredits={remainingCredits}
      creditCost={creditCost}
      onClose={() => setShowCreditModal(false)}
    />
  )}
</>
  );
};



function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export default ChatComponent;