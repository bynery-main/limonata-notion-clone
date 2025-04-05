import React from "react";
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
      {/* Button with gradient border */}
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-0 rounded-full p-[2px] bg-gradient-to-r from-[#C66EC5] to-[#FC608D] shadow-lg"
        >
          <button
            onClick={toggleChat}
            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white transition-all"
          >
            <MessageSquare className="h-6 w-6 text-gray-800" />
            <span className="sr-only">Open chat</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatButton;