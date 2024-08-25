import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UnsubscribeButtonProps {
  userId: string;
  subscriptionStatus: string; // Add subscriptionStatus prop
}

export const UnsubscribeButton: React.FC<UnsubscribeButtonProps> = ({ userId, subscriptionStatus }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnsubscribeClick = async () => {
    if (!userId) {
      alert("Please log in to manage your subscription.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/cancel-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
      });

      const data = await response.json();
      console.log('Subscription cancelled:', data.subscription);

      if (response.ok) {
        alert("Your subscription has been cancelled successfully.");
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert("There was an error cancelling your subscription. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUnsubscribeClick}
      disabled={isLoading}
      className="bg-blue-500 text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-blue-600 transition-colors"
    >
      {isLoading
        ? 'Processing...'
        : subscriptionStatus === 'active_pending_cancellation'
        ? 'Resubscribe'
        : 'Stop Subscription'}
    </Button>
  );
};

export default UnsubscribeButton;
