"use client";

import Image from "next/image";
import { Tabs } from "../ui/tabs";
import gradient from "./images/Gradient.png";
import studyguideimage from "./images/StudyGuide.png";
import flashcardimage from "./images/Flashcards.png";
import tutorimage from "./images/Chat.png";
import quizimage from "./images/Quiz.png";

export function TabsDemo() {
  const tabs = [
    {
      title: "Quiz",
      value: "quiz",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-yellow-600 bg-gray-200 bg-opacity-70 backdrop-blur">
          <p>AI Quizes</p>
          <p className="text-sm font-light mt-4">
            Test your knowledge with questions created by AI
            using all your study resources.
            You will also be corrected and given a grade and explanations
            for each question.
            <img src={quizimage.src} alt="Gradient" className="object-contain" />

          </p>
        </div>
      ),
    },
    {
      title: "AI Study Guide",
      value: "study guides",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-pink-600 bg-gray-200 bg-opacity-70 backdrop-blur">
          <p>AI Study Guides</p>
          <p className="text-sm font-light mt-4">
            Get AI-generated study guides for all your study resources.
            You can also customize the study guides to your liking.
            <img src={studyguideimage.src} alt="Gradient" className="object-contain" />
          </p>
        </div>
      ),
    },
    {
      title: "Flashcards",
      value: "flashcards",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-orange-600 bg-gray-200 bg-opacity-70 backdrop-blur">
          <p>AI Flashcards</p>
          <p className="text-sm font-light mt-4">
            Improve your retention using AI-generated flashcards based on your study resources.
            <img src={flashcardimage.src} alt="Gradient" className="object-contain" />

          </p>
        </div>
      ),
    },
    {
      title: "Tutor",
      value: "tutor",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-blue-600 bg-gray-200 bg-opacity-70 backdrop-blur">
          <p>AI Personal Tutor</p>
          <p className="text-sm font-light mt-4 ">
            Get a personal tutor that will help you understand your study resources better.
            Ask questions and get answers instantly based on your study resources.
            <img src={tutorimage.src} alt="Gradient" className="object-contain" />

          </p>
        </div>
      ),
    },

  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-10">
    <div className="relative h-[20rem] md:h-[40rem] [perspective:1000px] flex flex-col mx-auto w-full items-start justify-start my-40">
      <div className="absolute top-0 left-0 w-full h-full px-20 md:px-40">
        <Tabs tabs={tabs} />
      </div>
{/* <img src={gradient.src} alt="Gradient" className="w-screen object-contain -my-55" /> */}    </div>
  </div>
  );
}

