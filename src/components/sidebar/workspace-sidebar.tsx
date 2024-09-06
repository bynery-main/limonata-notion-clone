import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Picker from "@emoji-mart/react";
import {
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import FoldersDropDown from "./folders-dropdown";
import FlashcardsDropdown from "./flashcards-dropdown";
import QuizzesDropdown from "./quizzes-dropdown";
import StudyGuideDropdown from "./studyguide-dropdown";
import CollaboratorSearch from "../collaborator-setup/collaborator-search";
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
import { GoProButton } from "../subscribe/subscribe-button";

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
  const [showGoProModal, setShowGoProModal] = useState(false); // State for Go Pro modal
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null); // State for subscription status
  const [tier, setTier] = useState<string | null>(null); // State for user tier
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
      console.log("Window resized, width set to:", screenWidth * 0.25);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    console.log("Setting up Firestore snapshot listener for workspace:", params.workspaceId);
    const workspaceRef = doc(db, "workspaces", params.workspaceId);

    const unsubscribe = onSnapshot(workspaceRef, (docSnapshot) => {
      console.log("Firestore snapshot triggered for workspace:", params.workspaceId);
      if (docSnapshot.exists()) {
        fetchExistingCollaborators();
        fetchEmoji();
      }
    });

    return () => {
      console.log("Cleaning up Firestore snapshot listener for workspace:", params.workspaceId);
      unsubscribe();
    };
  }, [params.workspaceId]);

  const fetchExistingCollaborators = async () => {
    console.log("Fetching existing collaborators for workspace:", params.workspaceId);
    const workspaceRef = doc(db, "workspaces", params.workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (workspaceSnap.exists()) {
      const data = workspaceSnap.data();
      const collaborators = data.collaborators || [];

      const collaboratorsWithEmails = await Promise.all(
        collaborators.map(async (uid: string) => {
          const email = await fetchUserEmailById(uid);
          console.log("Fetched email for collaborator:", uid, email);
          return { uid, email };
        })
      );

      setExistingCollaborators(collaboratorsWithEmails);
    }
  };

  const fetchEmoji = async () => {
    console.log("Fetching emoji for workspace:", params.workspaceId);
    const workspaceRef = doc(db, "workspaces", params.workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (workspaceSnap.exists()) {
      const data = workspaceSnap.data();
      if (data.emoji) {
        console.log("Emoji found:", data.emoji);
        setEmoji(data.emoji);
      }
    }
  };

  const handleFolderSelect = (folder: Folder) => {
    console.log("Folder selected:", folder.id);
    setCurrentFolderId(folder.id);
    router.push(`/dashboard/${params.workspaceId}/${folder.id}`);
  };

  const handleFlashcardDeckSelect = (deck: { id: string }) => {
    console.log("Flashcard deck selected:", deck.id);
    setCurrentFlashcardDeckId(deck.id);
    router.push(`/dashboard/${params.workspaceId}/decks/${deck.id}`);
  };

  const handleQuizSetSelect = (quizSet: { id: string }) => {
    console.log("Quiz set selected:", quizSet.id);
    setCurrentQuizSetId(quizSet.id);
    router.push(`/dashboard/${params.workspaceId}/quizzes/${quizSet.id}`);
  };

  const handleStudyGuideSelect = (studyGuide: { id: string }) => {
    console.log("Study guide selected:", studyGuide.id);
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
        console.log("Sidebar width adjusted to:", newWidth);
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
    console.log("Emoji selected:", emoji.native);
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
    const workspaceRef = doc(db, "workspaces", params.workspaceId);
    await updateDoc(workspaceRef, { emoji: emoji.native });
  };

  const handleAddCollaborator = (user: { uid: string; email: string }) => {
    console.log("Collaborator added:", user);
    setNewCollaborators((prev) => [...prev, user]);
  };



  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  useEffect(() => {
    const getWorkspaceDetails = async () => {
      console.log("Fetching workspace details for:", params.workspaceId);
      const workspaceRef = doc(db, "workspaces", params.workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);

      try {
        const workspaceData = workspaceSnap.data();
        const workspaceName = workspaceData?.name;
        setWorkspaceName(workspaceName);
        console.log("Workspace name fetched:", workspaceName);
      } catch (error) {
        console.error("Error getting workspace details:", error);
      }
    }; 

    getWorkspaceDetails();
  }, [params.workspaceId]);

  const { user } = useAuth();
  const currentUserUid = user?.uid || "";
  const currentUserEmail = user?.email || "";

  // New useEffect for listening to changes in subscription status and tier
  useEffect(() => {
    if (!currentUserUid) return;

    const userDocRef = doc(db, "users", currentUserUid);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setSubscriptionStatus(userData?.subscriptionStatus || "inactive");
        setTier(userData?.tier || "free"); // Update the state with the tier
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  const handleSettingsClick = () => {
    if (params.workspaceId) {
      router.push(`/dashboard/${params.workspaceId}/settings`);
    } else {
      alert("Please select a workspace first");
    }
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 flex h-full w-72 flex-col border-r bg-white sm:static sm:h-auto shadow-[0px_64px_64px_-32px_#6624008f] backdrop-blur-[160px] backdrop-brightness-[100%]">
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

        <SyncWorkspaceButton className="mx-4 shadow-lg" workspaceId={params.workspaceId} />

        {(tier === "free" || subscriptionStatus === "active_pending_cancellation") && (
          <Button 
            onClick={() => setShowGoProModal(true)} 
            className="mx-4 mt-4 shadow-lg"
          >
            {subscriptionStatus === "active_pending_cancellation" ? "Resubscribe" : "Go Pro"}
          </Button>
        )}
        
        <div className="px-4">
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
                People and Settings
              </h3>
              <div className="grid gap-1">
                <CollaboratorSearch
                  existingCollaborators={existingCollaborators.map(
                    (c) => c.uid
                  )}
                  currentUserUid={currentUserUid!}
                  onAddCollaborator={handleAddCollaborator}
                  onOpen={fetchExistingCollaborators}
                  workspaceId={params.workspaceId}
                >
                  <div
                    className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a] cursor-pointer"
                    onClick={() => setShowCollaborators(true)}
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    Add People
                  </div>
                </CollaboratorSearch>
                <div
                  className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a] cursor-pointer"
                  onClick={handleSettingsClick}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </div>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Modal for Go Pro */}
      {showGoProModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Go Pro</h2>
            <ul className="list-disc list-inside mb-6">
              <li>Access to premium features</li>
              <li>Priority support</li>
              <li>More storage for your workspaces</li>
              <li>Collaborate with more team members</li>
              <li>Advanced analytics and insights</li>
            </ul>
            <GoProButton
              className="w-full"
              userEmail={currentUserEmail!}
              userId={currentUserUid!}
              subscriptionStatus={subscriptionStatus}
            />
            <Button
              onClick={() => setShowGoProModal(false)}
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