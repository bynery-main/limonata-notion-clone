import React, { useState } from "react";
import { StarsIcon } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/firebaseConfig";
import NoCreditsModal from "../subscribe/no-credits-modal"; // Import the NoCreditsModal component
import ReactMarkdown from "react-markdown";

interface SummariseProps {
  refString: string;
  type: string;
  userId: string; // Add userId prop
}

interface SummariseResponse {
  answer: string;
  success: boolean;
}

interface CreditUsageResult {
  success: boolean;
  remainingCredits: number;
}

const Summarise: React.FC<SummariseProps> = ({ refString, type, userId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState(0);
  const creditCost = 5; 

  const handleSummariseClick = async () => {
    setLoading(true);

    const functions = getFunctions(app);
    const creditValidation = httpsCallable<{ uid: string; cost: number }, CreditUsageResult>(functions, "useCredits");
    const summariseAgent = httpsCallable<{ ref: string; type: string }, SummariseResponse>(functions, "summariseAgent");

    try {
      const creditUsageResult = await creditValidation({
        uid: userId,
        cost: creditCost,
      });

      console.log("Credit usage result:", creditUsageResult.data);

      if (!creditUsageResult.data.success) {
        setRemainingCredits(creditUsageResult.data.remainingCredits);
        setShowCreditModal(true);
        setLoading(false);
        return;
      }

      // If credit check passes, proceed with summarization
      console.log("Summarising agent for ref:", refString);

      const response = await summariseAgent({
        ref: refString,
        type: type,
      });

      console.log("Summarisation response:", response);
      setSummaryText(response.data.answer);
    } catch (error) {
      console.error("Error during summarisation:", error);
      setSummaryText("Error occurred during summarisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 ">
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
      

      {summaryText && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Summary:</h4>
          <p className="text-sm whitespace-pre-line"><ReactMarkdown className="prose dark:prose-invert">{summaryText}</ReactMarkdown></p>
        </div>
      )}
      
      {showCreditModal && (
        <NoCreditsModal
          remainingCredits={remainingCredits}
          creditCost={creditCost}
          onClose={() => setShowCreditModal(false)}
        />
      )}
    </div>
  );
};

export default Summarise;