import React, { useEffect, useState } from "react";
import { ChevronDown, UserPlus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchUsers } from "@/lib/db/users/get-users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CollaboratorList from "@/components/collaborator-setup/collaborator-list";

interface CollaboratorSearchProps {
  children: React.ReactNode;
  existingCollaborators: { uid: string; email: string }[];
  currentUserUid: string;
  onAddCollaborator: (user: { uid: string; email: string }) => void;
  onOpen: () => void;
  style?: React.CSSProperties;
  workspaceId: string;
  onCollaboratorRemoved: () => void;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  currentUserUid,
  onAddCollaborator,
  onOpen,
  style,
  workspaceId,
  onCollaboratorRemoved,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newCollaborators, setNewCollaborators] = useState<{ uid: string; email: string }[]>([]);

  const addCollaboratorLocal = (user: { uid: string; email: string }) => {
    onAddCollaborator(user);
    setNewCollaborators([...newCollaborators, user]);
  };

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      const filtered = fetchedUsers.filter(
        (user) =>
          user.uid !== currentUserUid &&
          !existingCollaborators.some(ec => ec.uid === user.uid)
      );
      setUsers(filtered);
      setFilteredUsers(filtered);
    };
    loadUsers();
  }, [existingCollaborators, currentUserUid]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      onOpen();
    }
  };

  const handleRemoveNewCollaborator = (uid: string) => {
    setNewCollaborators(newCollaborators.filter(nc => nc.uid !== uid));
  };

  return (
    <div style={style}>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
        <Button className="flex w-full bg-white justify-start text-gray-500">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Members
        </Button>
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
            placeholder="Search by email"
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
          </ScrollArea>
          <CollaboratorList
            workspaceId={workspaceId}
            existingCollaborators={existingCollaborators}
            newCollaborators={newCollaborators}
            onRemove={handleRemoveNewCollaborator}
            onCollaboratorRemoved={onCollaboratorRemoved}
          />
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" className="flex-1">
              Share Link
            </Button>
            <Button variant="outline" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Button>
            <Button variant="outline" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaboratorSearch;