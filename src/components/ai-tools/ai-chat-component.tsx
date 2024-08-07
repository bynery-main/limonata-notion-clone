"use client";

import React, { useState } from "react";
import { StarsIcon } from "lucide-react";
import FlashcardComponent from "./flashcard-component";
import QuizzesComponent from "./quizzes-component";
import "./ai-chat-component.css";
import { Carousel, Card } from "../ui/apple-cards-carousel";
import { BackgroundGradient } from "../ui/background-gradient";

interface AIChatComponentProps {
  workspaceId: string;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({ workspaceId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

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

  const FilledStarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
      <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );

  const cards = [
    {
      src: "/path-to-flashcard-image.jpg",
      title: "Create Flashcards",
      category: "Study Tool",
      content: <button onClick={openFlashcardModal}>Create Flashcards</button>,
    },
    {
      src: "/path-to-study-guide-image.jpg",
      title: "Create a Study Guide",
      category: "Study Tool",
      content: <div>Study Guide Content</div>,
    },
    {
      src: "/path-to-ai-tutor-image.jpg",
      title: "AI Tutor",
      category: "Learning Assistant",
      content: <div>AI Tutor Content</div>,
    },
    {
      src: "/path-to-quiz-image.jpg",
      title: "Create Quizzes",
      category: "Assessment Tool",
      content: <button onClick={openQuizModal}>Create Quizzes</button>,
    },
  ];

  return (
    <>
      <button
        className="relative mb-2 inline-flex h-12 bg-white overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        onClick={toggleModal}
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white px-3 py-1 text-sm font-medium text-[#393BB2] backdrop-blur-2xl">
          <StarsIcon />
        </span>
      </button>

      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/50">
          <BackgroundGradient className="w-full max-w-6xl h-[80vh] rounded-xl p-[1px]">
            <div className="w-full h-full bg-white/80 dark:bg-black/80 rounded-xl p-8 overflow-auto relative z-10">
              <button onClick={toggleModal} className="absolute top-4 right-4 text-2xl font-bold">
                &times;
              </button>
              <div className="flex justify-center items-center mb-8 space-x-4">

                <h2 className="text-4xl font-bold text-center animated-gradient-text">
                  Learn using AI
                </h2>
              </div>

              <Carousel 
                items={cards.map((card, index) => (
                  <Card 
                    key={index} 
                    card={card} 
                    index={index} 
                    layout={true} 
                    className="h-64 w-48 md:h-[30rem] md:w-80"
                  />
                ))} 
              />
            </div>
          </BackgroundGradient>
        </div>
      )}


      {isFlashcardModalOpen && (
        <FlashcardComponent onClose={closeFlashcardModal} workspaceId={workspaceId} />
      )}

      {isQuizModalOpen && (
        <QuizzesComponent onClose={closeQuizModal} workspaceId={workspaceId} />
      )}
    </>
  );
};

export default AIChatComponent;