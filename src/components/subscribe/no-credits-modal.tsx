import React from "react";
import { Button } from "@chakra-ui/react";
import { GoProButton } from "@/components/subscribe/subscribe-button";
import { useAuth } from "@/components/auth-provider/AuthProvider";

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
  // Use useAuth to get the current user's details if not passed as props
  const { user } = useAuth();
  const resolvedUserId = userId || user?.uid || "";
  const resolvedUserEmail = userEmail || user?.email || "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Not Enough Credits</h2>
        <p className="mb-2">You don&apos;t have enough credits to proceed.</p>
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
        {/* Conditionally render the GoProButton only if userId and userEmail are available */}
        {resolvedUserId && resolvedUserEmail ? (
          <GoProButton
            className="w-full"
            userId={resolvedUserId}
            userEmail={resolvedUserEmail}
          />
        ) : (
          <Button className="w-full" isDisabled>
            Go Pro Now (Login Required)
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outline"
          className="mt-2 ml-2 w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default NoCreditsModal;
