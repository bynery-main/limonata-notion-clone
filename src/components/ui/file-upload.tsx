import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import FileUploader from '../drag-n-drop/drag-n-drop';
import FancyText from "@carefully-coded/react-text-gradient";
import { usePathname } from "next/navigation";
import { createPortal } from 'react-dom';

interface Folder {
  id: string;
  name: string;
  contents: any;
  filests: any;
}

interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
  fileType: string;
  folderId?: string;
}

interface FileUploadProps {
  workspaceId: string;
  db: any;
  onFileUpload: (file: FileData) => void;
  folder?: Folder;  
  isBentoGridEmpty: boolean;
}

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 10, y: -10, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const FileUpload: React.FC<FileUploadProps> = ({ workspaceId, db, onFileUpload, folder, isBentoGridEmpty }) => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [isUploaderVisible, setIsUploaderVisible] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const showHelp = isBentoGridEmpty;
  const fileUploadRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsUploaderVisible(true);
  };

  const handleClose = () => {
    setIsUploaderVisible(false);
    setSelectedFile(undefined);
  };
  
  // Add these handlers to properly handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setIsUploaderVisible(true);
    }
  };

  const pathname = usePathname();

  // Check if the pathname ends with 'settings'
  if (pathname?.endsWith('/settings')) {
    return null; // Don't render the component
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", isBentoGridEmpty ? "scale-105" : "")}>
      {!isUploaderVisible ? (
        <motion.div
          ref={fileUploadRef}
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover="animate"
          className={cn(
            "p-4 sm:p-6 md:p-8 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden",
            isBentoGridEmpty ? "border-2 border-dashed border-gray-300 hover:border-[#F6B144]" : "",
            isDraggingOver ? "border-[#F6B144] bg-gray-50" : ""
          )}
        >
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="relative z-20 font-bold text-neutral-700  text-sm sm:text-base">
              <FancyText gradient={{ from: "#FE7EF4", to: "#F6B144" }}>
                Upload file
              </FancyText>
            </p>
            <p className="relative z-20 font-medium text-center text-neutral-400  text-xs sm:text-sm mt-2">
              Click or drag and drop it here!
            </p>

            <div className="relative w-full mt-6 sm:mt-8 max-w-xs mx-auto font-light">
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white flex items-center justify-center h-24 sm:h-28 w-full max-w-[6rem] sm:max-w-[7rem] mx-auto rounded-xl",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                <IconUpload className="w-5 h-5 text-gray-400" />
              </motion.div>
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-pink-400 inset-0 z-30 bg-transparent flex items-center justify-center h-24 sm:h-28 w-full max-w-[6rem] sm:max-w-[7rem] mx-auto rounded-xl"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      ) : (
        typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[99999] flex items-center justify-center">
            <div className="relative z-[100000] bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <FileUploader
                workspaceId={workspaceId}
                db={db}
                onFileUpload={onFileUpload}
                isVisible={true}
                onClose={handleClose}
                initialFile={selectedFile}
                folder={folder}
              />
            </div>
          </div>,
          document.body
        )
      )}
      <div className="text-center mt-6">
        <button 
          onClick={() => {
            // This will trigger the same action as the "New Live Note" button
            const event = new CustomEvent('create-new-note');
            document.dispatchEvent(event);
          }}
          className="text-sm text-gray-400 font-medium flex items-center justify-center mx-auto bg-white px-4 py-2 rounded-lg group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <svg 
            className="w-4 h-4 mr-2 transition-colors group-hover:stroke-[#C66EC5]" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#C66EC5] group-hover:to-[#FC608D]">
            Or create a new<span className="font-bold ml-1">Collaborative Live Note</span>
          </span>
        </button>
      </div>
    </div>
  );
}

export function GridPattern() {
  const columns = 21;
  const rows = 11;
  return (
    <div className="flex bg-gray-100  flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-4 h-4 sm:w-6 sm:h-6 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 "
                  : "bg-gray-50 shadow-[0px_0px_1px_2px_rgba(255,255,255,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}