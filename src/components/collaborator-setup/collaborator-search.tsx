import React, { useState, useEffect } from "react";
import { UserPlus } from 'lucide-react';
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

interface CollaboratorSearchProps {
  children: React.ReactNode;
  existingCollaborators: string[];
  currentUserUid: string;
  onAddCollaborator: (user: { uid: string; email: string }) => void;
  onOpen: () => void;
  style?: React.CSSProperties;
  workspaceId: string;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  currentUserUid,
  onAddCollaborator,
  onOpen,
  style,
  workspaceId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newCollaborators, setNewCollaborators] = useState<{ uid: string; email: string }[]>([]);
  const [existingCollaboratorsWithEmail, setExistingCollaboratorsWithEmail] = useState<{ uid: string; email: string }[]>([]);
  const [workspaceOwners, setWorkspaceOwners] = useState<string[]>([]);

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
  }, [workspaceId]);

  useEffect(() => {
    fetchExistingCollaborators();
  }, [existingCollaborators]);

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      const ownersEmails = await Promise.all(
        workspaceOwners.map(async (uid) => {
          const email = await fetchUserEmailById(uid);
          return email;
        })
      );
      const filtered = fetchedUsers.filter(
        (user) =>
          user.uid !== currentUserUid &&
          !existingCollaborators.includes(user.uid) &&
          !newCollaborators.some(nc => nc.uid === user.uid) &&
          !workspaceOwners.includes(user.uid) &&
          !ownersEmails.includes(user.email)
      );
      setUsers(filtered);
    };
    loadUsers();
  }, [existingCollaborators, currentUserUid, newCollaborators, workspaceOwners]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    if (query.length >= 6) {
      const filtered = users
        .filter((user) => user.email.toLowerCase().includes(query))
        .slice(0, 3); // Limit to top 3 results
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, users]);

  const fetchExistingCollaborators = async () => {
    const collaboratorsWithEmails = await Promise.all(
      existingCollaborators.map(async (uid: string) => {
        const email = await fetchUserEmailById(uid);
        return { uid, email };
      })
    );
    setExistingCollaboratorsWithEmail(collaboratorsWithEmails);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      onOpen();
    }
  };

  const addCollaboratorLocal = (user: { uid: string; email: string }) => {
    setNewCollaborators(prev => [...prev, user]);
    onAddCollaborator(user);
    setSearchQuery(""); // Clear the search query after adding a collaborator
  };

  const handleRemoveNewCollaborator = (uid: string) => {
    setNewCollaborators(prev => prev.filter(nc => nc.uid !== uid));
  };

  const handleSaveCollaborators = async () => {
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
      console.log(response.message);
      setNewCollaborators([]);
      fetchExistingCollaborators();
      console.log("Collaborators updated successfully");
    } catch (error) {
      console.error("Error updating collaborators:", error);
    }
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
              Search for collaborators or add from previous collaborators.
            </SheetDescription>
          </SheetHeader>
          <Input
            placeholder="Search by email (enter at least 6 characters)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 mt-4"
          />
          <ScrollArea className="h-[200px] w-full rounded-md border mb-4">
            {filteredUsers.map((user) => (
              <div
                key={user.uid}
                className="p-4 flex justify-between items-center"
              >
                <div className="text-sm overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                  {user.email}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addCollaboratorLocal(user)}
                >
                  Add
                </Button>
              </div>
            ))}
            {searchQuery.length > 0 && searchQuery.length < 6 && (
              <div className="p-4 text-sm text-muted-foreground">
                Enter at least 6 characters to search
              </div>
            )}
            {searchQuery.length >= 6 && filteredUsers.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">
                No matching users found
              </div>
            )}
          </ScrollArea>
          <CollaboratorList
            workspaceId={workspaceId}
            existingCollaborators={existingCollaboratorsWithEmail}
            newCollaborators={newCollaborators}
            onRemove={handleRemoveNewCollaborator}
            onCollaboratorRemoved={fetchExistingCollaborators}
          />
          <Button onClick={handleSaveCollaborators} className="mt-4">
            Save Changes
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaboratorSearch;