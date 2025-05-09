import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, X } from 'lucide-react';
import FancyText from "@carefully-coded/react-text-gradient";
import { createPortal } from 'react-dom';

interface CreateFolderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isVisible, onClose, onCreateFolder }) => {
  const [folderName, setFolderName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    typeof window !== 'undefined' && createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[99999] flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md relative z-[100000]"
        >
          <div className="text-center mb-6">
            <FancyText gradient={{ from: "#FE7EF4", to: "#F6B144" }} className="text-2xl font-bold">
              Create a New Topic
            </FancyText>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Your workspace is empty. Let&apos;s create your first topic!
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-gray-100 dark:bg-neutral-700 rounded-lg p-2">
              <FolderPlus className="w-6 h-6 text-gray-400 dark:text-gray-300 mr-2" />
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder= "Enter Topic name (e.g. 'Exam 1')"
                className="bg-transparent flex-grow focus:outline-none text-gray-800 dark:text-gray-200 font-medium"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="p-[1px] relative block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#C66EC5] to-[#FC608D] rounded-xl" />
                <div className="px-4 py-3 relative bg-white dark:bg-neutral-800 rounded-xl group transition duration-200 text-sm text-black dark:text-white hover:bg-transparent hover:text-white">
                  <div className="flex items-center whitespace-nowrap">
                    Create Topic
                  </div>
                </div>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>,
      document.body
    )
  );
};

export default CreateFolderModal;