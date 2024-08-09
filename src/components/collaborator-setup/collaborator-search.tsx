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
  onAddCollaborator: (user: { uid: string; email: string }) => void; // New prop to handle adding
  style?: React.CSSProperties;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({ children, existingCollaborators, currentUserUid, onAddCollaborator, style }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ uid: string; email: string }[]>([]);

  const addCollaboratorLocal = (user: { uid: string; email: string }) => {
    setSelectedUsers(prev => [...prev, user]);
    onAddCollaborator(user); // Directly use the prop here instead of from 'props'
  };

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers.filter(user => user.uid !== currentUserUid && !existingCollaborators.includes(user.uid)));
    };
    loadUsers();
  }, [existingCollaborators, currentUserUid]);

  return (
    <div style={style}> 
      <Sheet>
        <SheetTrigger className="w-full">{children}</SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]" style={{ zIndex: 10020 }}> {/* Add zIndex here */}

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
                  onClick={() => addCollaboratorLocal(user)}
                >
                  Add
                </Button>
              </div>
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaboratorSearch;