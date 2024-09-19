import { FilloutPopupEmbed } from "@fillout/react";
import { useState } from "react";
import "@fillout/react/style.css";
import React from "react";

const FeedbackForm = () => {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Feedback</button>

      {isOpen && (
        <FilloutPopupEmbed
          filloutId="5Y9w3Z9i7Wus"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default FeedbackForm;






