import React, { useState } from "react";
import { StarsIcon } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions"; // Correct import for Firebase functions
import { app } from "@/firebase/firebaseConfig"; // Import your Firebase app configuration

interface SummariseProps {
  refString: string;
  type: string;
}

interface SummariseResponse {
  answer: string;
  success: boolean;
}

const Summarise: React.FC<SummariseProps> = ({ refString, type }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null); // To store the summarisation response

  const handleSummariseClick = async () => {
    setLoading(true);

    const functions = getFunctions(app); // Initialize Firebase Functions
    const summariseAgent = httpsCallable<{ ref: string; type: string }, SummariseResponse>(functions, "summariseAgent"); // Define callable function with correct response type

    try {
      console.log("Summarising agent for ref:", refString);

      const response = await summariseAgent({
        ref: refString,
        type: type,
      });

      console.log("Summarisation response:", response);
      setSummaryText(response.data.answer); // Store the received summary text
    } catch (error) {
      console.error("Error during summarisation:", error);
      setSummaryText("Error occurred during summarisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        className="p-[2px] relative transition-transform duration-300 ease-in-out transform hover:scale-105"
        onClick={handleSummariseClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={loading}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
        <div
          className={`px-4 py-2 bg-white rounded-[6px] relative duration-300 ${
            isHovered
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              : "text-purple-500"
          }`}
        >
          <div className="text-lg flex items-center">
            <StarsIcon
              className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                isHovered ? "rotate-180" : ""
              }`}
            />
            {loading ? "Summarising..." : "Summarise"}
          </div>
        </div>
      </button>

      {/* Display the summarised text below the button if available */}
      {summaryText && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Summary:</h4>
          <p className="text-sm whitespace-pre-line">{summaryText}</p>
        </div>
      )}
    </div>
  );
};

export default Summarise;
