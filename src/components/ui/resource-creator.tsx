"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import FancyText from "@carefully-coded/react-text-gradient";
import { usePathname } from "next/navigation";
import { createPortal } from 'react-dom';
import FlashcardComponent from "../ai-tools/flashcard-component";
import QuizComponent from "../ai-tools/quizzes-component";
import StudyGuideComponent from "../ai-tools/study-guide-component";

interface ResourceCreatorProps {
  workspaceId: string;
  userId: string;
  type: "decks" | "quizzes" | "studyguides";
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

export const ResourceCreator: React.FC<ResourceCreatorProps> = ({ 
  workspaceId, 
  userId, 
  type, 
  isBentoGridEmpty 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showHelp = isBentoGridEmpty;

  const handleClick = () => {
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const pathname = usePathname();

  // Check if the pathname ends with 'settings'
  if (pathname?.endsWith('/settings')) {
    return null; // Don't render the component
  }

  // Determine title and description based on type
  let title = "";
  let description = "";
  
  switch (type) {
    case "decks":
      title = "Create Flashcards";
      description = "Generate AI flashcards from your notes";
      break;
    case "quizzes":
      title = "Create Quiz";
      description = "Generate AI quizzes from your notes";
      break;
    case "studyguides":
      title = "Create Study Guide";
      description = "Generate AI study guides from your notes";
      break;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!isModalVisible ? (
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
              <FancyText gradient={{ from: "#FE7EF4", to: "#F6B144" }}>
                {title}
              </FancyText>
            </p>
            <p className="relative z-20 font-sans font-normal text-center text-neutral-400 dark:text-neutral-400 text-xs sm:text-sm mt-2">
              {description}
            </p>
            <div className="relative w-full mt-6 sm:mt-8 max-w-xs mx-auto font-light">
              <motion.div
                layoutId={`${type}-creator`}
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-24 sm:h-28 w-full max-w-[6rem] sm:max-w-[7rem] mx-auto rounded-xl",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                <IconPlus className="w-5 h-5 text-gray-400" />
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
            {type === "decks" && (
              <FlashcardComponent 
                onClose={handleClose} 
                workspaceId={workspaceId} 
                userId={userId}
                onBack={() => {}} 
              />
            )}
            {type === "quizzes" && (
              <QuizComponent 
                onClose={handleClose} 
                workspaceId={workspaceId} 
                userId={userId}
                onBack={() => {}} 
              />
            )}
            {type === "studyguides" && (
              <StudyGuideComponent 
                onClose={handleClose} 
                workspaceId={workspaceId} 
                userId={userId}
                onBack={() => {}} 
              />
            )}
          </div>,
          document.body
        )
      )}
    </div>
  );
};

// Reuse the GridPattern from FileUpload
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