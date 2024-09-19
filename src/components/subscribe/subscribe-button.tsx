import React from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface SubscribeButtonProps {
  className?: string;
  userId: string;
  userEmail: string;
  subscriptionStatus?: string | null; // Add subscriptionStatus as a prop
}

export const GoProButton: React.FC<SubscribeButtonProps> = ({
  className,
  userId,
  userEmail,
  subscriptionStatus,
}) => {

  const handleGoProClick = async () => {
    if (!userId) {
      alert("Please log in to subscribe.");
      return;
    }

    // Get the user's document from Firestore
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      alert("User document not found.");
      return;
    }

    const userData = userDoc.data();

    // Create the checkout session
    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: "price_1Q0ib8HfxCOA3TIsebmMFejg",
        userId: userId,
        userEmail: userEmail,
        userName: userData.name || "",
      }),
    });

    const session = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = session.url;
  };

  return (
    <Button onClick={handleGoProClick} className={className}>
      {subscriptionStatus === "active_pending_cancellation" ? "Resubscribe" : "Go Pro Now"}
    </Button>
  );
};

export default GoProButton;
