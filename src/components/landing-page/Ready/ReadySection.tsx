import React from "react";
import "./ReadySection.scss";
import { GradientButton } from "../UI/PrimaryButton/PrimaryButton";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";


const studyFeatures = [
  {
    title: "Flash Cards",
    icon: "⚡️"
  },
  {
    title: "Practice Quizzes",
    icon: "❔"
  },
  {
    title: "Study Guides",
    icon: "📚"
  }
];



const notifications = [
  {
    user: "📅 Andrea",
    action: "changed the due date of",
    item: "Project Homepage",
    date: "Mar 15",
  },
  {
    user: "✍️ Michael",
    action: "added a new quiz to",
    item: "Biology 101",
    date: "Mar 14",
  },
  {
    user: "📚 Sarah",
    action: "shared notes for",
    item: "Chemistry Final",
    date: "Mar 14",
  }
];



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

const GradeRing = () => (
  <div className="grade-ring-container">
    <div className="grade-ring">
      <span className="grade">A+</span>
    </div>
    <div className="floating-notifications">
      {notifications.map((notif, index) => (
        <div className="notification-box" key={index}>
          <div className="notification-content">
            <p><strong>{notif.user}</strong> {notif.action} <strong>{notif.item}</strong></p>
            <span className="notification-date">{notif.date}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReadySection = () => {
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
    <section className="ready-section">
      <div className="ready-section__header">
        <h2>
          Face every exam <span className="highlight">
            feeling ready
            <WavyUnderline />
          </span>
        </h2>
        <p>
          Templates, tasks, and meeting tools make it effortless to supercharge
          your studies.
        </p>
      </div>

      <div className="ready-section__container">
        <div className="ready-right">
          <div className="ready-section__card ready-section__card--tools">
            <div className="card-content">
              <h3>Collaborate with your friends</h3>
            </div>
            <GradeRing />
          </div>

          <button 
            className="p-[1px] relative block mx-auto w-full sm:w-auto mt-4"                  
            onClick={() => {
              window.umami?.track('clicked-third-CTA');
              login();
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
            <div className="px-6 py-3 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center font-semibold">
              Start for free
              
            </div>
          </button>
        </div>

        <div className="ready-left">
          <div className="ready-section__card ready-section__card--flashcards">
            <div className="card-content">
              <h3>Your study workflow in one place</h3>
              <p>
                 In Limonata, you&apos;ll find all your study essentials—from flashcards to quizzes and guides—designed to streamline your workflow and boost your learning efficiency.
              </p>
            </div>
            <div className="features-grid">
              {studyFeatures.map((feature, index) => (
                <div className="feature-card" key={index}>
                  <span className="feature-icon">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadySection;
