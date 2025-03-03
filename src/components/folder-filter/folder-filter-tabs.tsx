import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FolderFilterTabsProps {
  folders: { id: string; name: string }[];
  activeFolder: string | null;
  onFolderChange: (folderId: string | null) => void;
  isVisible: boolean;
}

const FolderFilterTabs: React.FC<FolderFilterTabsProps> = ({
  folders,
  activeFolder,
  onFolderChange,
  isVisible,
}) => {
  return (
    <div className="h-[40px] relative">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2 px-4 overflow-x-auto absolute w-full no-scrollbar"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFolderChange(null)}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors relative",
                activeFolder === null
                  ? "text-[#C66EC5]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {activeFolder === null && (
                <div className="absolute inset-0 rounded-full p-[1px]">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C66EC5] to-[#FC608D]"></div>
                  <div className="absolute inset-[1px] rounded-full bg-white"></div>
                </div>
              )}
              <span className="relative z-10">All Topics</span>
            </motion.button>
            
            {folders.map((folder, index) => (
              <motion.button
                key={folder.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20,
                  transition: { delay: (folders.length - index) * 0.03 }
                }}
                onClick={() => onFolderChange(folder.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors relative",
                  activeFolder === folder.id
                    ? "text-[#C66EC5]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {activeFolder === folder.id && (
                  <div className="absolute inset-0 rounded-full p-[1px]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C66EC5] to-[#FC608D]"></div>
                    <div className="absolute inset-[1px] rounded-full bg-white"></div>
                  </div>
                )}
                <span className="relative z-10">{folder.name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FolderFilterTabs; 