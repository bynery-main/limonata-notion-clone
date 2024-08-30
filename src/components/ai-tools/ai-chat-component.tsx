"use client";

import React, { useState } from "react";
import { StarsIcon } from "lucide-react";
import FlashcardComponent from "./flashcard-component";
import QuizzesComponent from "./quizzes-component";
import "./ai-chat-component.css";
import { Carousel, Card } from "../ui/apple-cards-carousel";
import { BackgroundGradient } from "../ui/background-gradient";
import flashcards from "../../images/flashcards.jpg";
import StudyGuideComponent from "./study-guide-component";
import { Button } from "@/components/ui/button";

interface AIChatComponentProps {
  workspaceId: string;
  userId: string;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({ workspaceId, userId }) => {
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

  const cards = [
    {
      src: 'https://images.unsplash.com/photo-1669968910904-c4738ba5be6e?q=80&w=2358&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: "Create Flashcards",
      category: "AI Study Tool",
      content: 
      <div>
        <div className="mb-5">
        Just select the notes you want to base the flashcards on and Gemini will automatically create them for you!
        </div>
        <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50" onClick={openFlashcardModal}>
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          Create Flashcards
          </span>
        </button>
      </div>,
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1677340725081-e81626d96e29?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Create a Study Guide",
      category: "AI Study Tool",
      content: <div>
        <div className="mb-5">
        Just select the notes you want to base the Study Guide on and Gemini will automatically create it for you!
        </div>
        <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50" onClick={openStudyGuideModal}>
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          Create Study Guide
          </span>
        </button>


      </div>,
    },
    {
      src: "https://images.unsplash.com/photo-1636033503567-a59bff19d79a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "AI Tutor",
      category: "Learning Assistant",
      content: <div>AI Tutor Content</div>,
    },
    {
      src: "https://images.unsplash.com/photo-1635492491273-455af7728453?q=80&w=2760&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Create Quizzes",
      category: "Assessment Tool",
      content: 
        <div>
        <div className="mb-5">
        Just select the notes you want to be quized on and Gemini will automatically create questions for you! When you&apos;re done answering them, the AI will evaluate your answers and even grade you based on them.
        </div>
        <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50" onClick={openQuizModal}>
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          Create Quizzes
          </span>
        </button>
      </div>,
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
        <div className="flex fixed inset-0 items-center justify-center z-50 backdrop-blur-sm bg-black/50">
          <div className="flex flex-col items-center">
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
                  />
                ))} 
              />

            </div>

          </BackgroundGradient>
          <div className="flex items-center justify-center mt-2 bg-white px-3 py-3 rounded-full text-s text-gray-600 z-10 font-light" style={{ fontFamily: 'Inter, sans-serif', marginTop: '-20px' }}>
          Powered by <img src="https://www.kbc.co.ke/wp-content/uploads/2024/02/gemini_hero_rgb.png" alt="Gemini" className="h-5 ml-1" style={{ marginTop: '-6px' }} />            </div>
        </div>
        </div>
      )}


      {isFlashcardModalOpen && (
        <FlashcardComponent onClose={closeFlashcardModal} workspaceId={workspaceId} userId={userId} />
      )}

      {isQuizModalOpen && (
        <QuizzesComponent onClose={closeQuizModal} workspaceId={workspaceId} userId={userId} />
      )}


      {isStudyGuideModalOpen && (
        <StudyGuideComponent onClose={closeStudyGuideModal} workspaceId={workspaceId} userId={userId} />
      )}
    </>
  );
};

export default AIChatComponent;

function setIsStudyGuideModalOpen(arg0: boolean) {
  throw new Error("Function not implemented.");
}
