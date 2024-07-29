import React from 'react';
import { Button } from "@/components/ui/button";
import firebase from 'firebase/app';
import 'firebase/functions';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface CollaboratorListProps {
    workspaceId: string;
    existingCollaborators: string[];
    newCollaborators: { uid: string; email: string }[];
    onRemove: (uid: string) => void;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({ workspaceId, existingCollaborators, newCollaborators, onRemove }) => {
    const removeCollaborator = async (uid: string) => {


        const functions = getFunctions();

        const removeCollaboratorFunction = httpsCallable(functions, "removeCollaborator");


        try {
            const result = await removeCollaboratorFunction({ workspaceId, userId: uid });
            console.log(result.data);
        } catch (error) {
            console.error("Error removing collaborator:", error);
        }
    };

    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Existing Collaborators</h3>
            {existingCollaborators.map(uid => (
                <div key={uid} className="flex justify-between items-center">
                    <span>{uid}</span>
                    <Button onClick={() => removeCollaborator(uid)} variant="destructive" size="sm">
                        Remove
                    </Button>
                </div>
            ))}
            
            <h3 className="font-semibold mt-4">New Collaborators</h3>
            {newCollaborators.map(user => (
                <div key={user.uid} className="flex justify-between items-center">
                    <span>{user.email}</span>
                    <Button onClick={() => onRemove(user.uid)} variant="destructive" size="sm">
                        Remove
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default CollaboratorList;
