import React from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface SubscribeButtonProps {
  className?: string;
  userId: string;
  userEmail: string;
}

export const GoProButton: React.FC<SubscribeButtonProps> = ({ className, userId, userEmail }) => {

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
        priceId: "price_1PrgSWHfxCOA3TIs0sPIkmn7",
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
      Go Pro Now
    </Button>
  );
};

export default GoProButton;