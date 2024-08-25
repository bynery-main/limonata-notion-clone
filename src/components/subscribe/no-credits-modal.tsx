import React from "react";
import { Button } from "@chakra-ui/react";
import { GoProButton } from "@/components/subscribe/subscribe-button";

interface NoCreditsModalProps {
  remainingCredits: number;
  creditCost: number;
  onClose: () => void;
}

const NoCreditsModal: React.FC<NoCreditsModalProps> = ({
  remainingCredits,
  creditCost,
  onClose,
}) => {
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
        <GoProButton className="w-full" />
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
