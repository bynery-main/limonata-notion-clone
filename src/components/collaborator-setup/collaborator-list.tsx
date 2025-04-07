import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { UserMinus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { Separator } from "@/components/ui/separator";

interface User {
  uid: string;
  email: string;
}

interface CollaboratorListProps {
    workspaceId: string;
    existingCollaborators: User[];
    newCollaborators: User[];
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
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const [localRemovedIds, setLocalRemovedIds] = useState<Set<string>>(new Set());
    
    // Store the ids that were successfully removed but might not be 
    // reflected in the parent component yet
    const [pendingRemovedIds, setPendingRemovedIds] = useState<Set<string>>(new Set());
    
    // Keep track of the previously seen collaborators to detect changes
    const [prevCollaboratorIds, setPrevCollaboratorIds] = useState<Set<string>>(new Set());
    
    // When existingCollaborators changes, update our local state
    useEffect(() => {
        const currentIds = new Set(existingCollaborators.map(c => c.uid));
        
        // If we have pending removals and they're now missing from existingCollaborators,
        // they've been successfully processed by the server
        if (pendingRemovedIds.size > 0) {
            const stillPending = new Set<string>();
            pendingRemovedIds.forEach(id => {
                if (currentIds.has(id)) {
                    stillPending.add(id);
                }
            });
            setPendingRemovedIds(stillPending);
        }
        
        // Update our previous ids tracker
        setPrevCollaboratorIds(currentIds as Set<string>);
    }, [existingCollaborators, pendingRemovedIds]);

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    const removeCollaborator = async (uid: string) => {
        setRemovingIds(prev => new Set(prev).add(uid));
        const removeCollaboratorFunction = httpsCallable(functions, "removeCollaborator");
        
        try {
            // First update local UI immediately for better UX
            setLocalRemovedIds(prev => {
                const newSet = new Set(prev);
                newSet.add(uid);
                return newSet;
            });
            
            // Call Firebase function to remove collaborator
            const result = await removeCollaboratorFunction({ workspaceId, userId: uid });
            
            // Add to our pending set to maintain UI consistency even if parent rerenders
            setPendingRemovedIds(prev => {
                const newSet = new Set(prev);
                newSet.add(uid);
                return newSet;
            });
            
            toast.success("Collaborator removed successfully");
            
            // Notify parent component to refresh the data
            onCollaboratorRemoved();
        } catch (error) {
            console.error("Error removing collaborator:", error);
            toast.error("Failed to remove collaborator");
            
            // On error, revert the optimistic update
            setLocalRemovedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(uid);
                return newSet;
            });
        } finally {
            setRemovingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(uid);
                return newSet;
            });
        }
    };

    // Filter out collaborators that have been locally removed OR are in the pending removed set
    const filteredExistingCollaborators = existingCollaborators.filter(
        (collab: User) => !localRemovedIds.has(collab.uid) && !pendingRemovedIds.has(collab.uid)
    );

    const renderCollaboratorItem = (collaborator: User, isNew: boolean = false) => {
        const isRemoving = removingIds.has(collaborator.uid);
        
        return (
            <div key={collaborator.uid} className="flex justify-between items-center py-2">
                <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>{getInitials(collaborator.email)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{collaborator.email}</span>
                    {isNew && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            New
                        </span>
                    )}
                </div>
                <Button 
                    onClick={() => isNew ? onRemove(collaborator.uid) : removeCollaborator(collaborator.uid)} 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    disabled={isRemoving}
                >
                    {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserMinus className="h-4 w-4" />
                    )}
                </Button>
            </div>
        );
    };

    return (
        <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Collaborators</h3>
            <div className="rounded-md border p-1">
                {filteredExistingCollaborators.length === 0 && newCollaborators.length === 0 ? (
                    <div className="text-sm text-center text-gray-500 py-4">
                        No collaborators added yet
                    </div>
                ) : (
                    <>
                        {filteredExistingCollaborators.length > 0 && (
                            <div className="space-y-1">
                                {filteredExistingCollaborators.map(collab => renderCollaboratorItem(collab))}
                            </div>
                        )}
                        
                        {filteredExistingCollaborators.length > 0 && newCollaborators.length > 0 && (
                            <Separator className="my-2" />
                        )}
                        
                        {newCollaborators.length > 0 && (
                            <div className="space-y-1">
                                {newCollaborators.map(collab => renderCollaboratorItem(collab, true))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CollaboratorList;