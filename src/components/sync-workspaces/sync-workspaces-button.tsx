import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, RefreshCw } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import NoCreditsModal from "../subscribe/no-credits-modal";
import { useAuth } from '../auth-provider/AuthProvider';
import CostButton from '../ai-tools/cost-button';

interface SyncWorkspaceButtonProps {
    workspaceId: string;
    onSyncComplete?: () => void;
    className?: string;
}

const gradientAnimation = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

const AnimatedButton = styled(motion.button)`
    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: ${gradientAnimation} 15s ease infinite;
    border: none;
    color: white;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    position: relative;
    overflow: hidden;
    
    &:hover {
        opacity: 0.9;
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const SyncWorkspaceButton: React.FC<SyncWorkspaceButtonProps> = ({ workspaceId, onSyncComplete, className }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [remainingCredits, setRemainingCredits] = useState(0);
    const { user } = useAuth(); 
    const creditCost = 15;

    const syncWorkspace = async () => {
        if (!user) {
            console.error("No user logged in");
            return;
        }

        setIsLoading(true);
        const functions = getFunctions();
        const creditValidation = httpsCallable(functions, 'useCredits');
        const syncWorkspaceNotesFunction = httpsCallable(functions, 'syncWorkspaceNotes');

        if (!workspaceId) {
            console.error("No workspace selected");
            setIsLoading(false);
            return;
        }

        try {
            const creditUsageResult = await creditValidation({ uid: user.uid, cost: creditCost });
            const creditResponse = creditUsageResult.data as { success: boolean; remainingCredits: number };

            if (!creditResponse.success) {
                setRemainingCredits(creditResponse.remainingCredits);
                setShowCreditModal(true);
                setIsLoading(false);
                return;
            }

            const result = await syncWorkspaceNotesFunction({ workspaceId });
            console.log(result.data);
            if (onSyncComplete) {
                onSyncComplete();
            }
        } catch (error) {
            console.error("Error syncing workspace:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatedButton
                onClick={syncWorkspace}
                disabled={isLoading}
                className={`${className} flex items-center justify-center`}
                title='All notes will now be added as context for the AI models'
                whileHover="hover"
                whileTap="tap"
            >
                <motion.span
                    className="inline-block transition-all duration-500"
                    variants={{
                        hover: { x: -20, opacity: 0 },
                        tap: { scale: 0.95 }
                    }}
                >
                    {isLoading ? 'Syncing...' : 'Sync Workspace'}
                </motion.span>
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ x: 20, opacity: 0 }}
                    variants={{
                        hover: { x: 0, opacity: 1 },
                        tap: { scale: 0.95 }
                    }}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <span className="whitespace-nowrap">15 Credits</span>
                    )}
                </motion.div>
               
            </AnimatedButton>

            {showCreditModal && (
                <NoCreditsModal
                    remainingCredits={remainingCredits}
                    creditCost={creditCost}
                    onClose={() => setShowCreditModal(false)}
                />
            )}
        </>
    );
};

export default SyncWorkspaceButton;