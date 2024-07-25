import React, { useEffect, useState, useRef } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";  
import { fetchUsers } from "@/lib/db/users/get-users";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollaboratorSearchProps {
    children: React.ReactNode;
    existingCollaborators: string[];
    currentUserUid: string;
    onAddCollaborators: (selectedUsers: { uid: string; email: string }[]) => void;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({ children, existingCollaborators, currentUserUid, onAddCollaborators }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ uid: string; email: string }[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers.filter(user => user.uid !== currentUserUid && !existingCollaborators.includes(user.uid)));
    };
    loadUsers();
  }, [existingCollaborators, currentUserUid]);

  const handleAddCollaborator = (user: { uid: string; email: string }) => {
    setSelectedUsers(prev => [...prev, user]);
  };

  const handleConfirmAddition = () => {
    onAddCollaborators(selectedUsers);
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger className="w-full">{children}</SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Search Collaborator</SheetTitle>
            <SheetDescription>
              <p className="text-sm text-muted-foreground">
                You can also remove collaborators after adding them from the settings tab.
              </p>
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md">
            {users.map((user) => (
              <div key={user.uid} className="p-4 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleAddCollaborator(user)}
                >
                  Add
                </Button>
              </div>
            ))}
          </ScrollArea>
          <Button onClick={handleConfirmAddition}>Confirm Additions</Button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaboratorSearch;
