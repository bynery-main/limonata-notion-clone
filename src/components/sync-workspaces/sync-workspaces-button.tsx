import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, RefreshCw, StarsIcon } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import NoCreditsModal from "../subscribe/no-credits-modal";
import { useAuth } from '../auth-provider/AuthProvider';
import toast from 'react-hot-toast';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface SyncWorkspaceButtonProps {
    workspaceId: string;
    onSyncComplete?: () => void;
    className?: string;
    onShowNoCreditsModal: (remainingCredits: number, creditCost: number) => void;
    maxCharCount?: number;
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
    transition: all 0.3s ease;
    
    &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const SyncWorkspaceButton: React.FC<SyncWorkspaceButtonProps> = ({
    workspaceId,
    onSyncComplete,
    className,
    onShowNoCreditsModal,
    maxCharCount = 200000
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [remainingCredits, setRemainingCredits] = useState(0);
    const { user } = useAuth(); 
    const creditCost = 15;
    const [isHovered, setIsHovered] = useState(false);
    const [workspaceCharCount, setWorkspaceCharCount] = useState(0);

    // Fetch workspace character count
    useEffect(() => {
        const fetchWorkspaceData = async () => {
            if (!workspaceId) return;
            
            try {
                const workspaceRef = doc(db, 'workspaces', workspaceId);
                const workspaceSnap = await getDoc(workspaceRef);
                
                if (workspaceSnap.exists()) {
                    setWorkspaceCharCount(workspaceSnap.data().charCount || 0);
                }
            } catch (error) {
                console.error('Error fetching workspace character count:', error);
            }
        };

        fetchWorkspaceData();
    }, [workspaceId]);

    const syncWorkspace = async () => {
        if (!user) {
            console.error("No user logged in");
            return;
        }

        // Check if character count exceeds the limit
        if (workspaceCharCount > maxCharCount) {
            toast.error(`Cannot sync workspace: Character limit exceeded (${workspaceCharCount.toLocaleString()}/${maxCharCount.toLocaleString()}). Please reduce content before syncing.`);
            return;
        }

        setIsLoading(true);
        const functions = getFunctions();
        const creditValidation = httpsCallable(functions, 'useCredits');
        const syncWorkspaceNotesFunction = httpsCallable(functions, 'syncWorkspaceNotes', {timeout: 240000});

        if (!workspaceId) {
            console.error("No workspace selected");
            setIsLoading(false);
            return;
        }

        try {
            const creditUsageResult = await creditValidation({ uid: user.uid, cost: creditCost });
            const creditResponse = creditUsageResult.data as { success: boolean; remainingCredits: number };
      
            if (!creditResponse.success) {
              onShowNoCreditsModal(creditResponse.remainingCredits, creditCost);
              return;
            }
      
            const result = await syncWorkspaceNotesFunction({ workspaceId });
            console.log(result.data);
            if (onSyncComplete) {
              onSyncComplete();
            }
            toast.success("Workspace synced successfully!");
          } catch (error) {
            console.error("Error syncing workspace:", error);
            toast.error("Error syncing workspace. Please try again.");
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
                title='Sync all the current material in this workspace with your AI knowledge base'
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
                    {isLoading ? 'Syncing... Plsss hang tight! \n (Could even take a couple minutes)' : 'Sync Workspace'}
                </motion.span>
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ x: 20, opacity: 0 }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    variants={{
                        hover: { x: 0, opacity: 1 },
                        tap: { scale: 0.95 }
                    }}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <div className="flex items-center">
                            <StarsIcon
                                className={`w-5 h-5 mr-2 transition-transform duration-300 ${isHovered ? "rotate-180" : ""}`}
                            />
                            <span className="whitespace-nowrap">{creditCost.toString()} credits</span>
                        </div>
                    )}
                </motion.div>
            </AnimatedButton>
            {workspaceCharCount > maxCharCount && (
                <div className="text-xs text-red-500 mt-2">
                    Character limit exceeded ({workspaceCharCount.toLocaleString()}/{maxCharCount.toLocaleString()}). Reduce content to sync.
                </div>
            )}
        </>
    );
};

export default SyncWorkspaceButton;