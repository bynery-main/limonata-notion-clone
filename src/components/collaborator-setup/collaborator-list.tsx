import React from 'react';
import { Button } from "@/components/ui/button";

interface CollaboratorListProps {
    existingCollaborators: string[];
    newCollaborators: { uid: string; email: string }[];
    onRemove: (uid: string) => void;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({ existingCollaborators, newCollaborators, onRemove }) => {
    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Existing Collaborators</h3>
            {existingCollaborators.map(uid => (
                <div key={uid} className="flex justify-between items-center">
                    <span>{uid}</span>
                    {/* You might want to add a remove button here as well, 
                    but it would require additional logic to remove from the database */}
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