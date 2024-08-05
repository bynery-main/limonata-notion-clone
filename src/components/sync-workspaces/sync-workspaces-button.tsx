import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2 } from 'lucide-react';

interface SyncWorkspaceButtonProps {
    workspaceId: string;
    onSyncComplete?: () => void;
    className?: string;
}

const SyncWorkspaceButton: React.FC<SyncWorkspaceButtonProps> = ({ workspaceId, onSyncComplete, className }) => {
    const [isLoading, setIsLoading] = useState(false);

    const syncWorkspace = async () => {
        setIsLoading(true);
        const functions = getFunctions();
        const syncWorkspaceNotesFunction = httpsCallable(functions, 'syncWorkspaceNotes');

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
        <Button
            onClick={syncWorkspace}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                </>
            ) : (
                'Sync Workspace'
            )}
        </Button>
    );
};

export default SyncWorkspaceButton;