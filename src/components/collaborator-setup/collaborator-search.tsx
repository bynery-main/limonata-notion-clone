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
  existingCollaborators: string[]; // Array of user IDs
  currentUserUid: string;
  style?: React.CSSProperties;
}


const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({ children, existingCollaborators, currentUserUid, style }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => user.uid !== currentUserUid && !existingCollaborators.includes(user.uid));

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
          <div className="flex justify-center items-center gap-2 mt-2">
            <Search />
            <Input
              name="search"
              className="dark:bg-background"
              placeholder="Search by email"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md">
            {filteredUsers.map((user) => (
              <div key={user.uid} className="p-4 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => console.log("Add", user)} // Placeholder for addCollaborator function
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
