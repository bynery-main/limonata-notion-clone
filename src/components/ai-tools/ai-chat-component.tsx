"use client";

import React, { useState } from "react";
import { CatIcon } from "lucide-react";
import FlashcardComponent from "./flashcard-component";

interface AIChatComponentProps {
  workspaceId: string;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({ workspaceId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);

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

  return (
    <>
      <button
        onClick={toggleModal}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg mb-2"
      >
        <CatIcon className="w-6 h-6" />
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
                <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2"></div>
                <p className="text-center">Create a Study Guide</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2"></div>
                <p className="text-center">AI Tutor</p>
              </div>
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleModal}
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
    </>
  );
};

export default AIChatComponent;
