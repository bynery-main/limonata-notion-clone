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
import FoldersDropDown from "./folders-dropdown";
import FlashcardsDropdown from "./flashcards-dropdown";
import QuizzesDropdown from "./quizzes-dropdown";
import StudyGuideDropdown from "./studyguide-dropdown";
import CollaboratorSearch from "../collaborator-setup/collaborator-search";
import CollaboratorList from "../collaborator-setup/collaborator-list";
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  doc,
  getDoc,
  onSnapshot,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../auth-provider/AuthProvider";
import { useRouter } from "next/navigation";
import { fetchUserEmailById } from "@/lib/db/users/get-users";
import SyncWorkspaceButton from "../sync-workspaces/sync-workspaces-button";

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
  onFoldersUpdate,
}) => {
  const router = useRouter();
  const [width, setWidth] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState<string>("🏔️");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [currentFlashcardDeckId, setCurrentFlashcardDeckId] = useState<
    string | null
  >(null);
  const [currentQuizSetId, setCurrentQuizSetId] = useState<string | null>(null);
  const [currentStudyGuideId, setCurrentStudyGuideId] = useState<string | null>(
    null
  );

  const [existingCollaborators, setExistingCollaborators] = useState<
    { uid: string; email: string }[]
  >([]);
  const [newCollaborators, setNewCollaborators] = useState<
    { uid: string; email: string }[]
  >([]);

  const functions = getFunctions();
  const db = getFirestore();
  const manageCollaborators = httpsCallable(functions, "manageCollaborators");

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

  useEffect(() => {
    const workspaceRef = doc(db, "workspaces", params.workspaceId);

    const unsubscribe = onSnapshot(workspaceRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        fetchExistingCollaborators();
        fetchEmoji();
      }
    });

    return () => unsubscribe();
  }, [params.workspaceId]);

  const fetchExistingCollaborators = async () => {
    const workspaceRef = doc(db, "workspaces", params.workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (workspaceSnap.exists()) {
      const data = workspaceSnap.data();
      const collaborators = data.collaborators || [];

      const collaboratorsWithEmails = await Promise.all(
        collaborators.map(async (uid: string) => {
          const email = await fetchUserEmailById(uid);
          return { uid, email };
        })
      );

      setExistingCollaborators(collaboratorsWithEmails);
    }
  };

  const fetchEmoji = async () => {
    const workspaceRef = doc(db, "workspaces", params.workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (workspaceSnap.exists()) {
      const data = workspaceSnap.data();
      if (data.emoji) {
        setEmoji(data.emoji);
      }
    }
  };

  const handleFolderSelect = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    router.push(`/dashboard/${params.workspaceId}/${folder.id}`);
  };

  const handleFlashcardDeckSelect = (deck: { id: string }) => {
    setCurrentFlashcardDeckId(deck.id);
    router.push(`/dashboard/${params.workspaceId}/decks/${deck.id}`);
  };

  const handleQuizSetSelect = (quizSet: { id: string }) => {
    setCurrentQuizSetId(quizSet.id);
    router.push(`/dashboard/${params.workspaceId}/quizzes/${quizSet.id}`);
  };

  const handleStudyGuideSelect = (studyGuide: { id: string }) => {
    setCurrentStudyGuideId(studyGuide.id);
    router.push(
      `/dashboard/${params.workspaceId}/studyguides/${studyGuide.id}`
    );
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

  const handleEmojiSelect = async (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
    const workspaceRef = doc(db, "workspaces", params.workspaceId);
    await updateDoc(workspaceRef, { emoji: emoji.native });
  };

  const handleAddCollaborator = (user: { uid: string; email: string }) => {
    setNewCollaborators((prev) => [...prev, user]);
  };

  const handleRemoveCollaborator = (uid: string) => {
    setNewCollaborators((prev) => prev.filter((user) => user.uid !== uid));
  };

  const handleSaveCollaborators = async () => {
    const allCollaborators = [
      ...existingCollaborators.map((user) => user.uid),
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

      const updatedCollaboratorsWithEmails = await Promise.all(
        response.updatedCollaborators.map(async (uid: string) => {
          const email = await fetchUserEmailById(uid);
          return { uid, email };
        })
      );

      setExistingCollaborators(updatedCollaboratorsWithEmails);
      setNewCollaborators([]);

    } catch (error) {
      console.error("Error updating collaborators:", error);
    }
  };

  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  useEffect(() => {
    const getWorkspaceDetails = async () => {
      const workspaceRef = doc(db, "workspaces", params.workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);

      try {
        const workspaceData = workspaceSnap.data();
        const workspaceName = workspaceData?.name;
        setWorkspaceName(workspaceName);
      } catch (error) {
        console.error("Error getting workspace details:", error);
      }
    }; 

    getWorkspaceDetails();
  }, [params.workspaceId]);

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
            {workspaceName}
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 z-20">
              <Picker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          <span className="sr-only">Limonata</span>
        </div>

        <SyncWorkspaceButton className="mx-4 shadow-lg"
        workspaceId={params.workspaceId} />

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="grid gap-4 text-sm font-medium">
          <FoldersDropDown
              workspaceId={params.workspaceId}
              onFoldersUpdate={onFoldersUpdate}
              currentFolderId={currentFolderId}
              onFolderSelect={handleFolderSelect}
            />
            <div>

              <h3 className="mb-2 mt-4 px-3 text-xs font-medium uppercase tracking-wider text-[#24222066]">
                AI Study Resources
              </h3>
              <div className="grid gap-4">
                <FlashcardsDropdown
                  workspaceId={params.workspaceId}
                  currentFlashcardDeckId={currentFlashcardDeckId}
                  onFlashcardDeckSelect={handleFlashcardDeckSelect}
                />
                <QuizzesDropdown
                  workspaceId={params.workspaceId}
                  currentQuizSetId={currentQuizSetId}
                  onQuizSetSelect={handleQuizSetSelect}
                />
                <StudyGuideDropdown
                  workspaceId={params.workspaceId}
                  currentStudyGuideId={currentStudyGuideId}
                  onStudyGuideSelect={handleStudyGuideSelect}
                />
            </div>
            </div>


            <div>
              <h3 className="mb-2 mt-4 px-3 text-xs font-medium uppercase tracking-wider text-[#24222066]">
                People
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
                  existingCollaborators={existingCollaborators.map(
                    (c) => c.uid
                  )}
                  currentUserUid={currentUserUid}
                  onAddCollaborator={handleAddCollaborator}
                  onOpen={fetchExistingCollaborators} // Trigger refresh on open
                >
                  <div
                    className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a] cursor-pointer"
                    onClick={() => setShowCollaborators(true)}
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    Add People
                  </div>
                </CollaboratorSearch>
              </div>
            </div>
          </nav>
        </div>
        <div
          className="w-1 h-full absolute top-0 right-0 cursor-ew-resize"
          onMouseDown={handleMouseDown}
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
              onCollaboratorRemoved={fetchExistingCollaborators}
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
