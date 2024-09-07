import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Trash } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CollaboratorListProps {
    workspaceId: string;
    existingCollaborators: { uid: string; email: string }[];
    newCollaborators: { uid: string; email: string }[];
    onRemove: (uid: string) => void;
    onCollaboratorRemoved: () => void;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
    workspaceId,
    existingCollaborators,
    newCollaborators,
    onRemove,
    onCollaboratorRemoved
}) => {
    const functions = getFunctions();
    const [isRemoving, setIsRemoving] = useState(false);
    const [removingEmail, setRemovingEmail] = useState('');

    const removeCollaborator = async (uid: string, email: string) => {
        setIsRemoving(true);
        setRemovingEmail(email);
        const removeCollaboratorFunction = httpsCallable(functions, "removeCollaborator");
        
        try {
            const result = await removeCollaboratorFunction({ workspaceId, userId: uid });
            console.log(result.data);
            onCollaboratorRemoved();
        } catch (error) {
            console.error("Error removing collaborator:", error);
        } finally {
            setIsRemoving(false);
            setRemovingEmail('');
        }
    };

    return (
        <div className="space-y-2">
            {isRemoving && (
                <Alert className="mb-4">
                    <AlertDescription>Removing collaborator: {removingEmail}...</AlertDescription>
                </Alert>
            )}
            <h3 className="font-semibold text-black">Existing Collaborators</h3>
            {existingCollaborators.map(({ uid, email }) => (
                <div key={uid} className="flex justify-between items-center">
                    <span>{email}</span>
                    <Button 
                        className='bg-transparent text-red-600 hover:text-red-800 hover:bg-transparent' 
                        onClick={() => removeCollaborator(uid, email)} 
                        size="sm"
                        disabled={isRemoving}
                    >
                       <Trash size={16} className='t' />
                    </Button>
                </div>
            ))}
            
            <h3 className="font-semibold mt-4">New Collaborators</h3>
            {newCollaborators.map(({ uid, email }) => (
                <div key={uid} className="flex justify-between items-center">
                    <span>{email}</span>
                    <Button 
                        onClick={() => onRemove(uid)} 
                        variant="destructive" 
                        size="sm"
                        disabled={isRemoving}
                    >
                        Remove
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default CollaboratorList;