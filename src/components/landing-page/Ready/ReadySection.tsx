import React from "react";
import "./ReadySection.scss";
import Image from "next/image";
import ai from "../../../../public/Images/upgrade/ai.png";

const studyFeatures = [
  {
    title: "Flash Cards",
    icon: "📝"
  },
  {
    title: "Practice Quizzes",
    icon: "✍️"
  },
  {
    title: "Study Guides",
    icon: "📚"
  }
];

const courses = [
  { name: "Literature", emoji: "📚" },
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

const ReadySection = () => {
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
        <div className="ready-left">
          <div className="ready-section__card ready-section__card--flashcards">
            <div className="card-content">
              <h3>Your study workflow in one place</h3>
              <p>
                 In Limonata, you'll find all your study essentials—from flashcards to quizzes and guides—designed to streamline your workflow and boost your learning efficiency.
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

          <div className="ready-section__card ready-section__card--ai">
            <div className="card-content">
              <h3>Use AI to skyrocket your productivity</h3>
              <p>Jot down tasks and assign action items in your meetings.</p>
            </div>
            <Image src={ai} alt="ai" />
          </div>
        </div>

        <div className="ready-right">
          <div className="ready-section__card ready-section__card--tools">
            <div className="card-content">
              <h3>Organize and share your course notes</h3>
              <p>
                Meeting spaces come loaded with a growing kit of meeting tools
                that power-up your meetings in a few clicks.
              </p>
            </div>
            {coursesList}
           
          </div>

          <button className="ready-section__button">
            Start for free
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReadySection;
