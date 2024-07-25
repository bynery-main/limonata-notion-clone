import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"  
import { fetchUsers } from "@/lib/db/users/get-users";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"

interface CollaboratorSearchProps {
    children: React.ReactNode;
    }

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({children}) => {

  return (
    <div>
      <Sheet>
        <SheetTrigger className="w-full z-600">{children}</SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Search Collaborator</SheetTitle>
            <SheetDescription>
              <p className="text-sm text-muted-foreground">
                You can also remove collaborators after adding them from the
                settings tab.
              </p>
            </SheetDescription>
          </SheetHeader>
          <div
            className="flex justify-center
          items-center
          gap-2
          mt-2
        "
          >
            <Search />
            <Input
              name="name"
              className="dark:bg-background"
              placeholder="Email"
            //   onChange={onChangeHandler}
            />
          </div>
          <ScrollArea
            className="mt-6
          overflow-y-scroll
          w-full
          rounded-md
        "
          >
            {/* {searchResults
              .filter(
                (result) =>
                  !existingCollaborators.some(
                    (existing) => existing.id === result.id
                  )
              )
              .filter((result) => result.id !== user?.id)
              .map((user) => (
                <div
                  key={user.id}
                  className=" p-4 flex justify-between items-center"
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className="text-sm 
                  gap-2 
                  overflow-hidden 
                  overflow-ellipsis 
                  w-[180px] 
                  text-muted-foreground
                  "
                    >
                      {user.email}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => addCollaborator(user)}
                  >
                    Add
                  </Button>
                </div>
              ))} */}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaboratorSearch;
