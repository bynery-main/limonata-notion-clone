import React from "react";
import "./UpgradeSection.scss";
import Image from "next/image";
import flashcards from "../../../public/Images/upgrade/flashcard.png";

const UpgradeSection = () => {
  return (
    <section className="upgrade-section">
      <div className="upgrade-section__header">
        <h2>
          Your notes just got an upgrade
        </h2>
        <p>
          Templates, tasks, and meeting tools make it effortless to supercharge
          your studies.
        </p>
      </div>

      <div className="upgrade-section__container">
        <div className="upgrade-left">
          <div className="upgrade-section__card upgrade-section__card--flashcards">
            <h3>Create flashcards in seconds</h3>
            <p>
              Templates allow you to recreate the perfect meeting in 1-click.
              And Templates can be added automatically to your weekly meetings,
              making it No-Click™.
            </p>
            <Image 
              src={flashcards} 
              alt="Flashcards preview" 
              width={400}
              height={200}
              className="object-contain"
            />
          </div>

          <div className="upgrade-section__card upgrade-section__card--ai">
            <h3>Use AI to skyrocket your productivity</h3>
            <p>Jot down tasks and assign action items in your meetings.</p>
          </div>
        </div>

        <div className="upgrade-right">
          <div className="upgrade-section__card upgrade-section__card--tools">
            <h3>Organize and share your course notes</h3>
            <p>
              Meeting spaces come loaded with a growing kit of meeting tools
              that power-up your meetings in a few clicks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpgradeSection;
