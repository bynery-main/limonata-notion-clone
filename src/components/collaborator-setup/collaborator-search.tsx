import React, { useState, useEffect, ReactNode } from "react";
import { UserPlus, Search, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchUsers, fetchUserEmailById } from "@/lib/db/users/get-users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CollaboratorList from "@/components/collaborator-setup/collaborator-list";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  uid: string;
  email: string;
}

interface CollaboratorSearchProps {
  children: ReactNode;
  existingCollaborators: string[];
  currentUserUid: string;
  onAddCollaborator: (user: User) => void;
  onOpen: () => void;
  style?: React.CSSProperties;
  workspaceId: string;
}

const CollaboratorSearch = ({
  children,
  existingCollaborators,
  currentUserUid,
  onAddCollaborator,
  onOpen,
  style,
  workspaceId,
}: CollaboratorSearchProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newCollaborators, setNewCollaborators] = useState<User[]>([]);
  const [existingCollaboratorsWithEmail, setExistingCollaboratorsWithEmail] = useState<User[]>([]);
  const [workspaceOwners, setWorkspaceOwners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const functions = getFunctions();
  const db = getFirestore();
  const manageCollaborators = httpsCallable(functions, "manageCollaborators");

  useEffect(() => {
    const fetchWorkspaceOwners = async () => {
      const workspaceRef = doc(db, "workspaces", workspaceId);
      const workspaceDoc = await getDoc(workspaceRef);
      if (workspaceDoc.exists()) {
        const owners = workspaceDoc.data()?.owners || [];
        setWorkspaceOwners(owners);
      }
    };
    fetchWorkspaceOwners();
  }, [workspaceId, db]);

  useEffect(() => {
    if (isOpen) {
      fetchExistingCollaborators();
    }
  }, [isOpen, existingCollaborators]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, existingCollaborators, currentUserUid, newCollaborators, workspaceOwners]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await fetchUsers();
      const ownersEmails = await Promise.all(
        workspaceOwners.map(async (uid) => {
          const email = await fetchUserEmailById(uid);
          return email;
        })
      );
      
      // Filter users who aren't already collaborators, owners, or the current user
      const filtered = fetchedUsers.filter(
        (user) =>
          user.uid !== currentUserUid &&
          !existingCollaborators.includes(user.uid) &&
          !newCollaborators.some(nc => nc.uid === user.uid) &&
          !workspaceOwners.includes(user.uid) &&
          !ownersEmails.includes(user.email)
      );
      setUsers(filtered);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    if (query.length >= 3) {
      const filtered = users
        .filter((user) => user.email.toLowerCase().includes(query))
        .slice(0, 5); // Show top 5 results
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
    setIsSearching(false);
  }, [searchQuery, users]);

  const fetchExistingCollaborators = async () => {
    setIsLoading(true);
    try {
      const collaboratorsWithEmails = await Promise.all(
        existingCollaborators.map(async (uid: string) => {
          const email = await fetchUserEmailById(uid);
          return { uid, email };
        })
      );
      setExistingCollaboratorsWithEmail(collaboratorsWithEmails);
    } catch (error) {
      console.error("Error fetching existing collaborators:", error);
      toast.error("Failed to load existing collaborators");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSearchQuery("");
      setFilteredUsers([]);
      setNewCollaborators([]);
      onOpen();
    }
  };

  const addCollaboratorLocal = (user: User) => {
    setNewCollaborators(prev => [...prev, user]);
    onAddCollaborator(user);
    setSearchQuery(""); // Clear the search query after adding a collaborator
    toast.success(`Added ${user.email} as collaborator`);
    
    // Update filtered users to remove the added user
    setFilteredUsers(prev => prev.filter(u => u.uid !== user.uid));
    
    // Update the main users list too
    setUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const handleRemoveNewCollaborator = (uid: string) => {
    const collaborator = newCollaborators.find(nc => nc.uid === uid);
    setNewCollaborators(prev => prev.filter(nc => nc.uid !== uid));
    
    // Add the removed collaborator back to the users list if they were filtered out
    if (collaborator) {
      setUsers(prev => [...prev, { uid: collaborator.uid, email: collaborator.email }]);
    }
    
    toast.success("Collaborator removed");
  };

  const handleSaveCollaborators = async () => {
    if (newCollaborators.length === 0) {
      setIsOpen(false);
      return;
    }
    
    setIsSaving(true);
    const allCollaborators = [
      ...existingCollaborators,
      ...newCollaborators.map(nc => nc.uid),
    ];
    
    try {
      const result = await manageCollaborators({
        workspaceId: workspaceId,
        userIds: allCollaborators, 
      });
      
      const response = result.data as {
        message: string;
        updatedCollaborators: string[];
      };
      
      setNewCollaborators([]);
      fetchExistingCollaborators();
      toast.success("Collaborators updated successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating collaborators:", error);
      toast.error("Failed to update collaborators");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleCollaboratorRemoved = () => {
    fetchExistingCollaborators();
  };

  return (
    <div style={style}>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]" style={{ zIndex: 10020 }}>
          <SheetHeader>
            <SheetTitle className="text-pink-500 flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Add Members
            </SheetTitle>
            <SheetDescription>
              Search for collaborators by email address
            </SheetDescription>
          </SheetHeader>
          
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Search by email (at least 3 characters)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Search Results</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border">
              {isSearching ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="p-4 flex justify-between items-center border-b last:border-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <div className="text-sm font-medium truncate">{user.email}</div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addCollaboratorLocal(user)}
                    >
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-center text-gray-500">
                  {searchQuery.length === 0 ? (
                    "Type to search for users"
                  ) : searchQuery.length < 3 ? (
                    "Enter at least 3 characters to search"
                  ) : (
                    "No matching users found"
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading collaborators...</span>
            </div>
          ) : (
            <CollaboratorList
              workspaceId={workspaceId}
              existingCollaborators={existingCollaboratorsWithEmail}
              newCollaborators={newCollaborators}
              onRemove={handleRemoveNewCollaborator}
              onCollaboratorRemoved={handleCollaboratorRemoved}
            />
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCollaborators} 
              disabled={isSaving || newCollaborators.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaboratorSearch;