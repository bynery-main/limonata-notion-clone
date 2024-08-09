import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/firebaseConfig"; // Ensure you have your Firebase config imported
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';

interface ChatComponentProps {
  onSendMessage: (workspaceId: string, query: string) => void;
}

interface ChatResponse {
  answer: string;
}

export function ChatComponent({ onSendMessage }: ChatComponentProps) {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<{ type: string, content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    const id = parts[2]; // Assuming the workspaceId is the third segment in the URL
    setWorkspaceId(id);
  }, []);
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
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleSend = async () => {
    if (inputMessage.trim() && workspaceId) {
      const newMessage = inputMessage.trim();
      setMessages([...messages, { type: 'user', content: newMessage }]);
      setInputMessage("");

      const functions = getFunctions(app);
      const chatWithWorkspace = httpsCallable<{ workspaceId: string, query: string }, ChatResponse>(functions, 'chatWithWorkspace');

      try {
        console.log("Sending query to chatWithWorkspace:", { workspaceId, query: newMessage });
        const result = await chatWithWorkspace({ workspaceId, query: newMessage });
        const answer = result.data.answer;
        setMessages(prevMessages => [...prevMessages, { type: 'assistant', content: answer }]);
      } catch (error) {
        console.error("Error during chatWithWorkspace:", error);
      }
    }
  };

  return (
    <>
      {isChatVisible ? (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md overflow-hidden bg-background/60 backdrop-blur-sm md:w-[400px] transition-transform duration-300 ease-in-out shadow-2xl">
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-background/10 bg-background/40 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                  <AvatarFallback>AC</AvatarFallback>
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
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                    {message.type === 'assistant' && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                    )}
<div className={`rounded-lg p-3 text-sm shadow ${message.type === 'user' ? 'bg-primary/80 backdrop-blur-sm text-primary-foreground' : 'bg-muted/20 backdrop-blur-sm'}`} style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                        ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                        ol: ({node, ...props}) => <ol className={markdownStyles.ol} {...props} />,
                        li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                        h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                        h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                        h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                        h4: ({node, ...props}) => <h4 className={markdownStyles.h4} {...props} />,
                        h5: ({node, ...props}) => <h5 className={markdownStyles.h5} {...props} />,
                        h6: ({node, ...props}) => <h6 className={markdownStyles.h6} {...props} />,
                        strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
                        code: ({node, inline, ...props}) => 
                          inline ? <code className={markdownStyles.code} {...props} /> : <pre className={markdownStyles.pre}><code {...props} /></pre>,
                      }}
                    >
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
                  <ArrowUpIcon className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground"
            onClick={toggleChat}
          >
            <ChatIcon className="h-6 w-6" />
            <span className="sr-only">Open Chat</span>
          </Button>
        </div>
      )}
    </>
  );
}

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
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

export default ChatComponent;
