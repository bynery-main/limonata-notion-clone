import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2 } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

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

const AnimatedButton = styled(Button)`
    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: ${gradientAnimation} 15s ease infinite;
    border: none;
    color: white;
    font-weight: bold;
    
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

    const syncWorkspace = async () => {
        setIsLoading(true);



        setIsLoading(true);
        const functions = getFunctions();
        const syncWorkspaceNotesFunction = httpsCallable(functions, 'syncWorkspaceNotes');
        if (!workspaceId) {
            console.error("No workspace selected");
            return;
        }
        try {
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
        try {
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
        <AnimatedButton
            onClick={syncWorkspace}
            disabled={isLoading}
            className={className}
            title='All notes will now be added as context for the AI models'
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                </>
            ) : (
                ['Sync Workspace']
            )}
        </AnimatedButton>
    );
};

export default SyncWorkspaceButton;