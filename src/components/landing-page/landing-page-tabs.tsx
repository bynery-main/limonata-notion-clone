import React from 'react';
import Image, { StaticImageData } from "next/image";
import { Tabs } from "../ui/tabs";
import Gradient from "../../../Public/Images/Gradient.png";
import studyguideimage from "../../../Public/Images/StudyGuide.png";
import flashcardimage from "../../../Public/Images/Flashcards.png";
import tutorimage from "../../../Public/Images/Chat.png";
import quizimage from "../../../Public/Images/Quiz.png";
import FancyText from '@carefully-coded/react-text-gradient';


interface TabContentProps {
  title: string;
  description: string;
  image: string;
  textColor: string;
  isFlashcard?: boolean;
}

function TabContent({ title, description, image, textColor, isFlashcard = false }: TabContentProps) {
  return (
    <div style={{ boxShadow: '0 2px 30px -3px rgba(0, 0, 0, 0.2), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)' }} className="w-full h-[40rem] overflow-hidden relative rounded-xl">
      <div className="absolute inset-0 z-0">
        {/* Render gradient background */}
        <img src={Gradient.src} alt="Gradient" className="w-full h-full object-cover opacity-50" />
      </div>
      <div className={`relative z-10 bg-white bg-opacity-70 backdrop-blur p-8 rounded-xl h-full flex ${isFlashcard ? 'flex-col' : 'flex-col md:flex-row'} items-center justify-between`}>
        <div className={`flex flex-col ${isFlashcard ? 'items-center' : 'items-center md:items-start'} ${isFlashcard ? 'mb-8' : 'md:w-1/2'}`}>
          <div className={`text-2xl md:text-4xl font-bold ${textColor} text-center ${isFlashcard ? '' : 'md:text-left'} mb-6`}>
            <FancyText gradient={{ from: '#F6B144', to: '#FE7EF4' }} className="font-extrabold">
              {title}
            </FancyText>
          </div>
          <p className={`text-base md:text-lg font-light text-gray-700 text-center ${isFlashcard ? '' : 'md:text-left'} max-w-xl`}>
            {description}
          </p>
        </div>
        <div className={`${isFlashcard ? 'w-full' : 'md:w-1/2'} flex justify-center items-center`}>
          <div className="relative w-full" style={{ height: isFlashcard ? '70%' : '100%', maxHeight: '25rem' }}>
            {/* Render content image */}
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error(`Error loading image: ${image}`);
                e.currentTarget.src = '/placeholder.png'; // Replace with an actual placeholder image path
              }}
            />
          </div>
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
          image={quizimage.src}
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
          image={studyguideimage.src}
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
          image={flashcardimage.src}
          textColor="text-orange-600"
          isFlashcard={true}
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
          image={tutorimage.src}
          textColor="text-blue-600"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center mb-10">
      <div className="relative h-[40rem] [perspective:1000px] flex flex-col mx-auto w-full items-start justify-start mb-40">
        <div className="absolute top-0 left-0 w-full h-full px-20 md:px-40">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
}