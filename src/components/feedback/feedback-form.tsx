import { FilloutPopupEmbed } from "@fillout/react";
import { useState } from "react";
import "@fillout/react/style.css";
import React from "react";

const FeedbackForm = () => {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Schedule a call</button>

      {isOpen && (
        <FilloutPopupEmbed
          filloutId="foAdHjd1Duus"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default FeedbackForm;




