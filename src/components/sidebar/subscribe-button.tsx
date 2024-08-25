import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SubscribeButtonProps {
  className?: string;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({ className }) => {
  const router = useRouter();

  const handleSubscribeClick = () => {
    // You can replace this with actual Stripe checkout URL later
    const stripeCheckoutUrl = "/checkout";
    router.push(stripeCheckoutUrl);
  };

  return (
    <Button
      onClick={handleSubscribeClick}
      className={className}
    >
      Go Pro
    </Button>
  );
};

export default SubscribeButton;
