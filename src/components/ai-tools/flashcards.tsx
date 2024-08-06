"use client";

import React, { useState } from "react";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsProps {
  flashcards: Flashcard[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  const handleNextCard = () => {
    setShowAnswer(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="mt-4 flex flex-col items-center">
      <div
        onClick={handleCardClick}
        className="w-full max-w-sm p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg cursor-pointer text-center"
      >
        {showAnswer ? currentFlashcard.answer : currentFlashcard.question}
      </div>
      <button
        onClick={handleNextCard}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Next
      </button>
    </div>
  );
};

export default Flashcards;
