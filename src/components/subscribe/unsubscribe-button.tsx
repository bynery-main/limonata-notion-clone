import React from 'react';
import { Button } from '@/components/ui/button';

export const UnsubscribeButton: React.FC = () => {
  const handleUnsubscribeClick = () => {
    // Placeholder function for unsubscribe logic
    console.log("Unsubscribe button clicked");
  };

  return (
    <Button
      onClick={handleUnsubscribeClick}
      className="bg-blue-500 text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-blue-600 transition-colors"
    >
      Stop Subscription
    </Button>
  );
};

export default UnsubscribeButton;
