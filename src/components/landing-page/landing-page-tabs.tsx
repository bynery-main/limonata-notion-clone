import React from 'react';
import Image, { StaticImageData } from "next/image";
import { Tabs } from "../ui/tabs";
import Gradient from "../../../public/Images/Gradient.png";
import studyguideimage from "../../../public/Images/StudyGuide.png";
import flashcardimage from "../../../public/Images/Flashcards.png";
import tutorimage from "../../../public/Images/Chat.png";
import quizimage from "../../../public/Images/Quiz.png";
import FancyText from '@carefully-coded/react-text-gradient';
import './landing-page-tabs.scss';


interface TabContentProps {
  title: string;
  description: string;
  image: string;
  textColor: string;
  isFlashcard?: boolean;
}

function TabContent({ title, description, image, textColor, isFlashcard = false }: TabContentProps) {
  return (
    <div className="tab-content">
      <div className="gradient-background">
        <img src={Gradient.src} alt="Gradient" />
      </div>
      <div className={`content-wrapper ${isFlashcard ? 'flashcard' : ''}`}>
        <div className={`text-content ${isFlashcard ? 'flashcard' : ''}`}>
          <div className={`title ${isFlashcard ? 'flashcard' : ''} ${textColor}`}>
            <FancyText gradient={{ from: '#F6B144', to: '#FE7EF4' }} className="font-extrabold">
              {title}
            </FancyText>
          </div>
          <p className={`description ${isFlashcard ? 'flashcard' : ''}`}>
            {description}
          </p>
        </div>
        <div className={`image-content ${isFlashcard ? 'flashcard' : ''}`}>
          <div className={`image-wrapper ${isFlashcard ? 'flashcard' : ''}`}>
            <img 
              src={image} 
              alt={title}
              onError={(e) => {
                console.error(`Error loading image: ${image}`);
                e.currentTarget.src = '/placeholder.png';
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
          title="AI Quizzes"
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
    <div className="tabs-container">
      <div className="tabs-perspective">
        <div className="tabs-wrapper">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
}