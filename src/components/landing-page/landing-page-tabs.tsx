import React from 'react';
import Image, { StaticImageData } from "next/image";
import { Tabs } from "../ui/tabs";
import Gradient from "./Images/Gradient.png";
import studyguideimage from "./images/StudyGuide.png";
import flashcardimage from "./images/Flashcards.png";
import tutorimage from "./images/Chat.png";
import quizimage from "./images/Quiz.png";

interface TabContentProps {
  title: string;
  description: string;
  image: StaticImageData;
  textColor: string;
}

function TabContent({ title, description, image, textColor }: TabContentProps) {
  return (
    <div className="w-full h-full overflow-hidden relative  shadow-xl rounded-xl overflow-hidden">
      <div className="absolute inset-0 z-0
      ">
        <img src={Gradient.src} alt="Gradient" className="object-cover w-full h-full opacity-50"
         />
      </div>
      <div className="relative z-10 bg-white bg-opacity-70 backdrop-blur p-8 rounded-xl h-full flex flex-col justify-between">
        <div>
          <p className={`text-2xl md:text-4xl font-bold ${textColor}`}>{title}</p>
          <p className="text-base md:text-lg font-light mt-6 text-gray-700">{description}</p>
        </div>
        <div className="mt-8 flex justify-center items-end h-3/5">
          <Image src={image} alt={title} className="object-contain max-h-full w-auto" />
        </div>
      </div>
    </div>
  );
}

export function TabsDemo() {
  const tabs = [
    {
      title: "Quiz",
      value: "quiz",
      content: (
        <TabContent
          title="AI Quizes"
          description="Test your knowledge with questions created by AI using all your study resources. You will also be corrected and given a grade and explanations for each question."
          image={quizimage}
          textColor="text-yellow-600"
        />
      ),
    },
    {
      title: "AI Study Guide",
      value: "study guides",
      content: (
        <TabContent
          title="AI Study Guides"
          description="Get AI-generated study guides for all your study resources. You can also customize the study guides to your liking."
          image={studyguideimage}
          textColor="text-pink-600"
        />
      ),
    },
    {
      title: "Flashcards",
      value: "flashcards",
      content: (
        <TabContent
          title="AI Flashcards"
          description="Improve your retention using AI-generated flashcards based on your study resources."
          image={flashcardimage}
          textColor="text-orange-600"
        />
      ),
    },
    {
      title: "Tutor",
      value: "tutor",
      content: (
        <TabContent
          title="AI Personal Tutor"
          description="Get a personal tutor that will help you understand your study resources better. Ask questions and get answers instantly based on your study resources."
          image={tutorimage}
          textColor="text-blue-600"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-10">
      <div className="relative h-[30rem] md:h-[50rem] [perspective:1000px] flex flex-col mx-auto w-full items-start justify-start my-40">
        <div className="absolute top-0 left-0 w-full h-full px-20 md:px-40">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
}