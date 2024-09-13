import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Trash } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

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
    const [allCollaborators, setAllCollaborators] = useState([...existingCollaborators, ...newCollaborators]);

    useEffect(() => {
        setAllCollaborators([...existingCollaborators, ...newCollaborators]);
    }, [existingCollaborators, newCollaborators]);

    const removeCollaborator = async (uid: string, email: string) => {
        setIsRemoving(true);
        setRemovingEmail(email);
        const removeCollaboratorFunction = httpsCallable(functions, "removeCollaborator");
        
        try {
            const result = await removeCollaboratorFunction({ workspaceId, userId: uid });
            console.log(result.data);
            setAllCollaborators(prevCollaborators => prevCollaborators.filter(c => c.uid !== uid));
            onCollaboratorRemoved();
            toast.success("Collaborator removed successfully!");
        } catch (error) {
            console.error("Error removing collaborator:", error);
            toast.error("Error removing collaborator. Please try again.");
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
            <h3 className="font-semibold text-black">All Collaborators</h3>
            {allCollaborators.map(({ uid, email }) => (
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
        </div>
    );
};

export default CollaboratorList;