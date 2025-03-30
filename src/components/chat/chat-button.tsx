import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface ChatButtonProps {
  toggleChat: () => void;
  isChatVisible: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ toggleChat, isChatVisible }) => {
  if (isChatVisible) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Button
        onClick={toggleChat}
        className="rounded-full shadow-lg p-3 bg-primary/80 hover:bg-primary/90"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="sr-only">Open chat</span>
      </Button>
    </motion.div>
  );
};

export default ChatButton;