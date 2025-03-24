import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import FileUploader from '../drag-n-drop/drag-n-drop';
import FancyText from "@carefully-coded/react-text-gradient";
import { usePathname } from "next/navigation";
import { createPortal } from 'react-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import toast from "react-hot-toast";

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

  
  const checkCharCountBeforeUpload = async () => {
    try {
      // Fetch charCount from workspace
      const workspaceRef = doc(db, "workspaces", workspaceId);
      const workspaceDoc = await getDoc(workspaceRef);
      const workspaceCharCount = workspaceDoc.data()?.charCount || 0;

      if (workspaceCharCount >= 200000) {
        toast.error("You have exceeded the character limit. Upload not allowed.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking workspace character count:", error);
      toast.error("Error checking character limit. Try again later.");
      return false;
    }
  };

  const handleClick = async () => {
    const canUpload = await checkCharCountBeforeUpload();
    if (!canUpload) return;
    setIsUploaderVisible(true);  };

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
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  
    const canUpload = await checkCharCountBeforeUpload();
    if (!canUpload) return;
  
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