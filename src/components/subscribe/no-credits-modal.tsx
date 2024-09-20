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
      
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-96">
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
        <PricingPage />
        {/* Conditionally render the GoProButton only if user is on the free tier */}
        {subscriptionStatus === "free" && resolvedUserId && resolvedUserEmail && (
          <GoProButton
            className="w-full"
            userId={resolvedUserId}
            userEmail={resolvedUserEmail}
          />
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