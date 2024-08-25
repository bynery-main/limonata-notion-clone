import React from "react";
import { Button } from "@/components/ui/button";

interface SubscribeButtonProps {
  className?: string;
}

export const GoProButton: React.FC<{ className?: string }> = ({ className }) => {
  const handleGoProClick = () => {
    // Redirect to Stripe checkout (replace with actual URL later)
    const stripeCheckoutUrl = "/checkout";
    window.location.href = stripeCheckoutUrl;
  };

  return (
    <Button onClick={handleGoProClick} className={className}>
      Go Pro Now
    </Button>
  );
};

export default GoProButton;
