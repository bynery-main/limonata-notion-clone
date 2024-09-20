import React, { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import { GoProButton } from "@/components/subscribe/subscribe-button";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { PricingPage } from "./pricing";
interface NoCreditsModalProps {
  remainingCredits: number;
  creditCost: number;
  onClose: () => void;
  userId?: string; // Made optional
  userEmail?: string; // Made optional
}

const NoCreditsModal: React.FC<NoCreditsModalProps> = ({
  remainingCredits,
  creditCost,
  onClose,
  userId,
  userEmail,
}) => {
  const { user } = useAuth();
  const resolvedUserId = userId || user?.uid || "";
  const resolvedUserEmail = userEmail || user?.email || "";

  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");

  useEffect(() => {
    if (!resolvedUserId) return;

    const userDocRef = doc(db, "users", resolvedUserId);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setSubscriptionStatus(userData?.tier || "free"); // Update the state with the tier
      }
    });

    return () => unsubscribe();
  }, [resolvedUserId]);

  const getNoCreditsText = () => {
    if (subscriptionStatus === "pro") {
      return "Whoops! You have reached your credit limit. It will be set to 1000 at 12pm.";
    } else {
      return "Whoops! You have reached your credit limit. It will be set to 100 at 12pm.";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      
      <div className=" bg-gradient-to-br from-green-50 via-blue-50 to-pink-50  dark:bg-neutral-800 rounded-lg p-6 w-200">
        {/* 
        <h2 className="text-xl font-bold mb-4">Not Enough Credits</h2>
        <p className="mb-2">{getNoCreditsText()}</p>
        <p className="mb-2">Credits remaining: {remainingCredits}</p>
        <p className="mb-4">Credit cost: {creditCost}</p>
        <h3 className="text-lg font-semibold mb-2">Why Go Pro?</h3>
        <ul className="list-disc list-inside mb-6">
          <li>Access to premium features</li>
          <li>Priority support</li>
          <li>More storage for your workspaces</li>
          <li>Collaborate with more team members</li>
          <li>Advanced analytics and insights</li>
        </ul>
        */}
        <h2 className="flex text-xl font-bold mb-4 justify-center">It seems like you run out of credits!</h2>
        
        <PricingPage />
        {/* Conditionally render the GoProButton only if user is on the free tier */}
        {subscriptionStatus === "free" && resolvedUserId && resolvedUserEmail && (
          <div className="flex items-center justify-center h-full">

          <GoProButton
          className=" mx-4 mt-4 shadow-lg inline-flex text-white h-10 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          userId={resolvedUserId}
            userEmail={resolvedUserEmail}
          />
          </div>
        )}
        <div className="flex justify-center items-center">

        <Button
          onClick={onClose}
          variant="outline"
          className="mt-2 ml-2 w-full"
        >
          Cancel
        </Button>
        </div>
      </div>
    </div>
  );
};

export default NoCreditsModal;