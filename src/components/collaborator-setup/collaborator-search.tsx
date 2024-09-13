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
import { User, fetchUsers, fetchUserEmailById, fetchUserById } from "@/lib/db/users/get-users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CollaboratorList from "@/components/collaborator-setup/collaborator-list";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from "react-hot-toast";
import { Avatar } from "@chakra-ui/react";
import { AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
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
  const [existingCollaboratorsWithData, setExistingCollaboratorsWithData] = useState<User[]>([]);  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const functions = getFunctions();
  const db = getFirestore();
  const manageCollaborators = httpsCallable(functions, "manageCollaborators");

  useEffect(() => {
    fetchExistingCollaborators();
  }, [existingCollaborators]);

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      const filtered = fetchedUsers.filter(
        (user) =>
          user.uid !== currentUserUid &&
          !existingCollaborators.includes(user.uid) &&
          !newCollaborators.some(nc => nc.uid === user.uid)
      );
      setUsers(filtered);
    };
    loadUsers();
  }, [existingCollaborators, currentUserUid, newCollaborators]);

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
    const collaboratorsWithData = await Promise.all(
      existingCollaborators.map(async (uid: string) => {
        return await fetchUserById(uid);
      })
    );
    setExistingCollaboratorsWithData(collaboratorsWithData);
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
      console.log(response.message);
      setNewCollaborators([]);
      fetchExistingCollaborators();
      console.log("Collaborators updated successfully");
    } catch (error) {
      console.error("Error updating collaborators:", error);
    }
    finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCollaborator = async (uid: string) => {
    setIsRemoving(true);
    try {
      // Your existing removal logic here
      // For example:
      // await removeCollaborator(workspaceId, uid);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      fetchExistingCollaborators();
    } catch (error) {
      console.error("Error removing collaborator:", error);
    } finally {
      setIsRemoving(false);
    }
  };
  const handleCollaboratorRemoved = () => {
    toast.success("Collaborator removed successfully");
    setTimeout(() => {
      //I'll comment this out because it seems like it takes a bit for the db to remove the collaborator
      //fetchExistingCollaborators();
    }, 5000); // 3000 milliseconds = 3 seconds
  };
  return (
    <div style={style}>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]" style={{ zIndex: 10020 }}>
          {isRemoving && (
            <Alert className="mb-4">
              <AlertDescription>Removing collaborator...</AlertDescription>
            </Alert>
          )}
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
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user.photoURL} alt={user.email} />
                  <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
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
            existingCollaborators={existingCollaboratorsWithData}
            newCollaborators={newCollaborators}
            onRemove={handleRemoveNewCollaborator}
            onCollaboratorRemoved={handleCollaboratorRemoved}
          />
          <Button onClick={handleSaveCollaborators} className="mt-4"
            disabled={isSaving || isRemoving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaboratorSearch;