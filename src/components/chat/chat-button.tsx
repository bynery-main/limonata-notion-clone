import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ChatButtonProps {
  toggleChat: () => void;
  isChatVisible: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ toggleChat, isChatVisible }) => {
  return (
    <AnimatePresence>
      {!isChatVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 right-4 z-50 group"
        >
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-x-2 group-hover:translate-x-0">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md whitespace-nowrap text-sm">
              AI Chat
            </div>
          </div>
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground"
            onClick={toggleChat}
          >
            <ChatIcon className="h-6 w-6" />
            <span className="sr-only">Open Chat</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
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
export default ChatButton;