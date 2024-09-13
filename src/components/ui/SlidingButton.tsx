import React from 'react';
import { motion } from 'framer-motion';

interface SlidingIconButtonProps {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const SlidingIconButton: React.FC<SlidingIconButtonProps> = ({ text, icon, onClick }) => {
  return (
    <motion.button
      className="relative overflow-hidden bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-md group"
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
    >
      <motion.span
        className="inline-block transition-all duration-500"
        variants={{
          hover: { x: -40, opacity: 0 },
          tap: { scale: 0.95 }
        }}
      >
        {text}
      </motion.span>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ x: 40, opacity: 0 }}
        variants={{
          hover: { x: 0, opacity: 1 },
          tap: { scale: 0.95 }
        }}
      >
        {icon}
      </motion.div>
    </motion.button>
  );
};

export default SlidingIconButton;