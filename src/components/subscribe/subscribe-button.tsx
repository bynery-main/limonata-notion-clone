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
        // Button code
        <button onClick={handleGoProClick} className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          {subscriptionStatus === "active_pending_cancellation" ? "Resubscribe" : "Go Pro Now"}
        </button>
  

      
  );
};

export default GoProButton;
