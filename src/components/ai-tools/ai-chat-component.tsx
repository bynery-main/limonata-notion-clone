"use client";

import React, { useState } from "react";
import { CatIcon, StarsIcon } from "lucide-react";
import FlashcardComponent from "./flashcard-component";
import QuizzesComponent from "./quizzes-component";
import StudyGuideComponent from "./study-guide-component";
import "./ai-chat-component.css";

interface AIChatComponentProps {
  workspaceId: string;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({ workspaceId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isStudyGuideModalOpen, setIsStudyGuideModalOpen] = useState(false); // State for study guide modal

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const openFlashcardModal = () => {
    setIsModalOpen(false);
    setIsFlashcardModalOpen(true);
  };

  const closeFlashcardModal = () => {
    setIsFlashcardModalOpen(false);
  };

  const openQuizModal = () => {
    setIsModalOpen(false);
    setIsQuizModalOpen(true);
  };

  const closeQuizModal = () => {
    setIsQuizModalOpen(false);
  };

  const openStudyGuideModal = () => {
    setIsModalOpen(false);
    setIsStudyGuideModalOpen(true);
  };

  const closeStudyGuideModal = () => {
    setIsStudyGuideModalOpen(false);
  };

  return (
    <>
        <button className="relative mb-2 inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                onClick={toggleModal}>

        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gradient-text rounded-full bg-black px-3 py-1 text-sm font-medium backdrop-blur-2xl">
            <StarsIcon />
        </span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Learn using AI</h2>
              <button onClick={toggleModal} className="text-xl font-bold">
                &times;
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <button
                  onClick={openFlashcardModal}
                  className="w-20 h-20 bg-gray-200 rounded-lg mb-2"
                ></button>
                <p className="text-center">Create Flashcards</p>
              </div>
              <div className="flex flex-col items-center">
                <button
                  onClick={openStudyGuideModal}
                  className="w-20 h-20 bg-gray-200 rounded-lg mb-2"
                ></button>
                <p className="text-center">Create a Study Guide</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2"></div>
                <p className="text-center">AI Tutor</p>
              </div>
              <div className="flex flex-col items-center">
                <button
                  onClick={openQuizModal}
                  className="w-20 h-20 bg-gray-200 rounded-lg mb-2"
                ></button>
                <p className="text-center">Create Quizzes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFlashcardModalOpen && (
        <FlashcardComponent onClose={closeFlashcardModal} workspaceId={workspaceId} />
      )}

      {isQuizModalOpen && (
        <QuizzesComponent onClose={closeQuizModal} workspaceId={workspaceId} />
      )}

      {isStudyGuideModalOpen && (
        <StudyGuideComponent onClose={closeStudyGuideModal} workspaceId={workspaceId} />
      )}
    </>
  );
};

export default AIChatComponent;
