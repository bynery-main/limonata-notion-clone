"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Picker from "@emoji-mart/react";
import {
  BoxIcon,
  CirclePlusIcon,
  LayoutGridIcon,
  LockIcon,
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
  ChevronRightIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import NativeNavigation from "./native-navigation";
import FoldersDropDown from "./folders-dropdown";
import CollaboratorSearch from "../collaborator-setup/collaborator-search";
import CollaboratorList from "../collaborator-setup/collaborator-list";
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useAuth } from "../auth-provider/AuthProvider";
import { useRouter } from 'next/navigation';
import { useFolder } from '@/contexts/FolderContext';

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}
interface FileData {
  id: string;
  name: string;
  url: string;
}
export interface WorkspaceSidebarProps {
  params: { workspaceId: string };
  className?: string;
  onFoldersUpdate: (folders: Folder[]) => void;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  params,
  className,
  onFoldersUpdate
}) => {
  const router = useRouter();
  const [width, setWidth] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState<string>("🏔️");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const { setCurrentFolder } = useFolder();

  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      setWidth(screenWidth * 0.25);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const handleFolderSelect = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setCurrentFolder(folder);
    router.push(`/dashboard/${params.workspaceId}/${folder.id}`);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (sidebarRef.current) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleEmojiSelect = (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const handleAddCollaborator = (user: { uid: string; email: string }) => {
    setNewCollaborators((prev) => [...prev, user]);
  };

  const handleRemoveCollaborator = (uid: string) => {
    setNewCollaborators((prev) => prev.filter((user) => user.uid !== uid));
  };

  const [existingCollaborators, setExistingCollaborators] = useState<string[]>(
    []
  );
  const [newCollaborators, setNewCollaborators] = useState<
    { uid: string; email: string }[]
  >([]);

  const functions = getFunctions();
  const db = getFirestore();
  const manageCollaborators = httpsCallable(functions, "manageCollaborators");

  const fetchExistingCollaborators = async () => {
    const workspaceRef = doc(db, "workspaces", params.workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (workspaceSnap.exists()) {
      const data = workspaceSnap.data();
      setExistingCollaborators(data.collaborators || []);
    }
  };

  useEffect(() => {
    fetchExistingCollaborators();
  }, [params.workspaceId, db]);

  const handleSaveCollaborators = async () => {
    const allCollaborators = [
      ...existingCollaborators,
      ...newCollaborators.map((user) => user.uid),
    ];

    try {
      const result = await manageCollaborators({
        workspaceId: params.workspaceId,
        userIds: allCollaborators,
      });

      const response = result.data as {
        message: string;
        updatedCollaborators: string[];
      };
      console.log(response.message);

      // Update the existing collaborators list with the response from the server
      setExistingCollaborators(response.updatedCollaborators);

      // Clear the new collaborators list
      setNewCollaborators([]);

      // You might want to show a success message to the user here
      // For example:
      // toast.success(response.message);
    } catch (error) {
      console.error("Error updating collaborators:", error);
      // You might want to show an error message to the user here
      // For example:
      // toast.error("Failed to update collaborators. Please try again.");
    }
  };

  const { user } = useAuth();
  const currentUserUid = user?.uid || "";

  return (
    <>
      <aside
        ref={sidebarRef}
        style={{ width }}
        className="fixed inset-y-0 left-0 z-10 flex h-full flex-col border-r bg-white sm:static sm:h-auto sm:w-auto shadow-[0px_64px_64px_-32px_#6624008f] backdrop-blur-[160px] backdrop-brightness-[100%]"
      >
        <div className="flex h-20 shrink-0 items-center border-b px-6 relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center gap-2 font-semibold"
          >
            <span>{emoji}</span>
            Biology
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 z-20">
              <Picker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          <span className="sr-only">Limonata</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="grid gap-4 text-sm font-medium">
            <FoldersDropDown 
              workspaceId={params.workspaceId} 
              onFoldersUpdate={onFoldersUpdate}
              currentFolderId={currentFolderId}
              onFolderSelect={handleFolderSelect}
            />
            <div>
              <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[#24222066]">
                Settings and People
              </h3>
              <div className="grid gap-1">
                <Link
                  href="#"
                  className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a]"
                  prefetch={false}
                >
                  <UsersIcon className="h-4 w-4" />
                  People
                </Link>
                <CollaboratorSearch
                  existingCollaborators={existingCollaborators}
                  currentUserUid={currentUserUid}
                  onAddCollaborator={handleAddCollaborator}
                >
                  <div className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a] cursor-pointer"
                    onClick={() => setShowCollaborators(true)}
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    Add People
                  </div>
                </CollaboratorSearch>
                {/* ... (keep other navigation items) */}
              </div>
            </div>
          </nav>
        </div>
        <div
          className="w-1 h-full absolute top-0 right-0 cursor-ew-resize"
          onMouseDown={handleMouseDown}
        />
        <NativeNavigation
          params={params}
          className={twMerge("my-2", className)}
        />
      </aside>
      {showCollaborators && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Manage Collaborators</h2>
            <CollaboratorList
              existingCollaborators={existingCollaborators}
              newCollaborators={newCollaborators}
              onRemove={handleRemoveCollaborator}
              workspaceId={params.workspaceId}
              onCollaboratorRemoved={fetchExistingCollaborators} // Pass the callback here
            />
            <Button onClick={handleSaveCollaborators} className="mt-4">
              Save Changes
            </Button>
            <Button
              onClick={() => setShowCollaborators(false)}
              variant="outline"
              className="mt-2 ml-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspaceSidebar;
