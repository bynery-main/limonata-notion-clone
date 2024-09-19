import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import FileUploader from '../drag-n-drop/drag-n-drop';
import FancyText from "@carefully-coded/react-text-gradient";

interface Folder {
  id: string;
  name: string;
  contents: any;
  filests: any;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploaderVisible, setIsUploaderVisible] = useState(false);
  const showHelp = isBentoGridEmpty;


  const handleClick = () => {
    setIsUploaderVisible(true);
  };

  const handleClose = () => {
    setIsUploaderVisible(false);
    setSelectedFile(undefined);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!isUploaderVisible ? (
        <motion.div
          onClick={handleClick}
          whileHover="animate"
          className="p-4 sm:p-6 md:p-8 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
        >
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-sm sm:text-base">
            <FancyText
            gradient={{ from: "#FE7EF4", to: "#F6B144" }}>
            Upload file
          </FancyText>
              
            </p>
            <p className="relative z-20 font-sans font-normal text-center text-neutral-400 dark:text-neutral-400 text-xs sm:text-sm mt-2">
              Click or drag and drop it here!
            </p>
            {showHelp && (
              <p className="text-center text-sm text-gray-500 italic z-50">
                Psst! If you&apos;re new here, make sure to create a folder
                first. It&apos;s like making a comfy bed for your files before
                tucking them in! (Check out the Workspace Sidebar)
              </p>
            )}
            <div className="relative w-full mt-6 sm:mt-8 max-w-xs mx-auto">
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-24 sm:h-28 w-full max-w-[6rem] sm:max-w-[7rem] mx-auto rounded-xl",
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
        <FileUploader
          workspaceId={workspaceId}
          db={db}
          onFileUpload={onFileUpload}
          isVisible={true}
          onClose={handleClose}
          initialFile={selectedFile}
          folder={folder}
        />
      )}
    </div>
  );
}

export function GridPattern() {
  const columns = 21;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-4 h-4 sm:w-6 sm:h-6 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_2px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_2px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}