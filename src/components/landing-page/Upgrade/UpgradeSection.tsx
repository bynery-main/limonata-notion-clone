import React from "react";
import "./UpgradeSection.scss";
import Image from "next/image";
import ai from "../../../../public/Images/upgrade/ai.png";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";

const flashcardContent = [
  {
    question: "Biology: Exam 1",
    questionDetail: "What is the powerhouse of the cell?",
    answer: "The Mitochondria",
    answerDetail: "It produces most of the cell's energy through ATP"
  },
  {
    question: "Biology: Exam 1",
    questionDetail: "What is cell division called?",
    answer: "Mitosis",
    answerDetail: "The process where a cell divides into two identical cells"
  },
  {
    question: "Biology: Exam 1",
    questionDetail: "What is the cell membrane made of?",
    answer: "Phospholipids",
    answerDetail: "A double layer that controls what enters and exits the cell"
  }
];

const stackedCards = (
  <div className="stacked-cards">
  {flashcardContent.map((content, index) => (
    <div className={`card card-${index + 1}`} key={index}>
      <div className="card-inner">
        <div className="card-front">
          <h4>{content.question}</h4>
          <p>{content.questionDetail}</p>
        </div>
        <div className="card-back">
          <h4>{content.answer}</h4>
          <p>{content.answerDetail}</p>
        </div>
      </div>
    </div>
  ))}
  </div>
)

const courses = [
  { name: "Mathematics", emoji: "🔢" },
  { name: "Biology", emoji: "🧬" },
  { name: "Chemistry", emoji: "⚗️" },
  { name: "Physics", emoji: "⚛️" },
  { name: "Computer Science", emoji: "💻" },

];

const coursesList = (
  <div className="courses-list">
  {courses.map((course, index) => (
    <div className="course-item" key={index}>
      <span className="course-emoji">{course.emoji}</span>
      <span className="course-name">{course.name}</span>
    </div>
  ))}
</div>
)

// Add this SVG path component
const WavyUnderline = () => (
  <svg className="wavy-underline" viewBox="0 0 300 30" width="300" height="30">
    <path 
      d="M 0 15 Q 25 0, 50 15 Q 75 30, 100 15 Q 125 0, 150 15 Q 175 30, 200 15 Q 225 0, 250 15 Q 275 30, 300 15" 
      fill="none" 
      stroke="#FD32AF" 
      strokeWidth="3"
    />
  </svg>
);

// Add this constant for the floating emojis
const floatingEmojis = (
  <div className="floating-emojis">
    <span className="floating-emoji" style={{"--delay": "0s"} as React.CSSProperties}>🎯</span>
    <span className="floating-emoji" style={{"--delay": "2s"} as React.CSSProperties}>💡</span>
    <span className="floating-emoji" style={{"--delay": "1s"} as React.CSSProperties}>🚀</span>
    <span className="floating-emoji" style={{"--delay": "3s"} as React.CSSProperties}>⭐</span>
  </div>
);

// Update the AI notifications implementation
const aiNotifications = [
  { text: "Summarizing your notes...", emoji: "📝" },
  { text: "Creating flashcards from your highlights...", emoji: "🔍" },
  { text: "Finding key concepts in your notes...", emoji: "🧠" },
  { text: "Generating practice questions...", emoji: "❓" }
];

const aiNotificationsElement = (
  <div className="ai-notifications">
    {aiNotifications.map((notification, index) => (
      <div 
        className="ai-notification" 
        key={index}
        style={{"--index": index} as React.CSSProperties}
        data-emoji={notification.emoji}
      >
        <span className="notification-text">{notification.text}</span>
      </div>
    ))}
  </div>
);

const UpgradeSection = () => {
  const provider = new GoogleAuthProvider();

  const login = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <section className="upgrade-section">
      <div className="upgrade-section__header">
        <h2>
          Your notes just <span className="highlight">
            got an upgrade
            <WavyUnderline />
          </span>
        </h2>
        <p>
          AI tools, flashcards, and organizers to supercharge your learning.
        </p>
      </div>

      <div className="upgrade-section__container">
        <div className="upgrade-left">
          <div className="upgrade-section__card upgrade-section__card--flashcards">
            <div className="card-content">
              <h3>Create flashcards in seconds</h3>
              <p>
                Turn notes into study materials instantly. AI identifies key concepts 
                and creates flashcards to boost retention.
              </p>
            </div>
            {floatingEmojis}
            {stackedCards}
          </div>

          <div className="upgrade-section__card upgrade-section__card--ai">
            <div className="card-content">
              <h3>AI-powered study assistant</h3>
              <p>
                Get summaries, practice questions, and concept explanations 
                to master any subject faster.
              </p>
            </div>
            {aiNotificationsElement}
            <Image src={ai} alt="ai" />
          </div>
        </div>

        <div className="upgrade-right">
          <div className="upgrade-section__card upgrade-section__card--tools">
            <div className="card-content">
              <h3>Organize your study materials</h3>
              <p>
                Keep study materials organized by subject. Share with classmates 
                and create collaborative study groups.
              </p>
            </div>
            {coursesList}
           
          </div>

          <button 
            className="p-[1px] relative block w-full sm:w-auto mx-auto"
            onClick={() => {
              window.umami?.track('clicked-second-CTA');
              login();
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
            <div className="px-6 py-3 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center font-semibold">
              Start studying smarter
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default UpgradeSection;
