import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Picker from "@emoji-mart/react";
import {
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
  FolderIcon,
  PencilIcon,
  BookIcon,
  LightbulbIcon,
  ArrowUp,
  ArrowUp01,

} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showGoProModal, setShowGoProModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFlashcardDeckId, setCurrentFlashcardDeckId] = useState<string | null>(null);
  const [currentQuizSetId, setCurrentQuizSetId] = useState<string | null>(null);
  const [currentStudyGuideId, setCurrentStudyGuideId] = useState<string | null>(null);
  const [existingCollaborators, setExistingCollaborators] = useState<
    { uid: string; email: string }[]
  >([]);
  const [newCollaborators, setNewCollaborators] = useState<
    { uid: string; email: string }[]
  >([]);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  const functions = getFunctions();
  const db = getFirestore();
  const manageCollaborators = httpsCallable(functions, "manageCollaborators");

  const { user } = useAuth();
  const currentUserUid = user?.uid || "";
  const currentUserEmail = user?.email || "";
  const MIN_WIDTH = 250;
  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      setWidth(Math.max(screenWidth * 0.25, MIN_WIDTH));
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

    return () => {
      unsubscribe();
    };
  }, [params.workspaceId]);

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

  useEffect(() => {
    if (!currentUserUid) return;

    const userDocRef = doc(db, "users", currentUserUid);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setSubscriptionStatus(userData?.subscriptionStatus || "inactive");
        setTier(userData?.tier || "free");
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);

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
    router.push(`/dashboard/${params.workspaceId}/studyguides/${studyGuide.id}`);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (sidebarRef.current) {
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= 500) {
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

  const handleSettingsClick = () => {
    if (params.workspaceId) {
      router.push(`/dashboard/${params.workspaceId}/settings`);
    } else {
      alert("Please select a workspace first");
    }
  };
  return (
    <>
      <motion.aside
        ref={sidebarRef}
        style={{ width: `${width}px`, minWidth: `${MIN_WIDTH}px` }}
        className="fixed inset-y-0 left-0 z-10 flex h-full flex-col border-r bg-white sm:static sm:h-auto sm:w-auto shadow-[0px_32px_32px_-16px_#66240066] backdrop-blur-[160px] backdrop-brightness-[100%]"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="flex h-20 shrink-0 items-center border-b px-6 relative"
          whileHover={{ scale: 1.05 }}
        >
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center gap-2 font-semibold"
          >
            <span>{emoji}</span>
            {workspaceName}
          </button>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                className="absolute top-full left-0 mt-2 z-20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Picker onEmojiSelect={handleEmojiSelect} />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Limonata</span>
        </motion.div>

        <SyncWorkspaceButton className="mx-4 shadow-lg" workspaceId={params.workspaceId} />

        {(tier === "free" || subscriptionStatus === "active_pending_cancellation") && (
          <Button 
            onClick={() => setShowGoProModal(true)} 
            className="mx-4 mt-4 shadow-lg nline-flex h-10 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            {subscriptionStatus === "active_pending_cancellation" ? "Resubscribe" : "Go Pro"}
          </Button>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="grid gap-4 text-sm font-medium">
            <div>
              <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[#24222066]">
              <div style={{ display: 'flex', alignItems: 'center' }}>
              
                AI Study Resources
              </div>
              </div>
              <motion.div className="grid gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <FlashcardsDropdown
                    workspaceId={params.workspaceId}
                    currentFlashcardDeckId={currentFlashcardDeckId}
                    onFlashcardDeckSelect={handleFlashcardDeckSelect}
                    icon={<LightbulbIcon className="h-4 w-4 mr-2" />}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <QuizzesDropdown
                    workspaceId={params.workspaceId}
                    currentQuizSetId={currentQuizSetId}
                    onQuizSetSelect={handleQuizSetSelect}
                    icon={<PencilIcon className="h-4 w-4 mr-2" />}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <StudyGuideDropdown
                    workspaceId={params.workspaceId}
                    currentStudyGuideId={currentStudyGuideId}
                    onStudyGuideSelect={handleStudyGuideSelect}
                    icon={<BookIcon className="h-4 w-4 mr-2" />}
                  />
                </motion.div>
              </motion.div>
            </div>

            <div>

                <FoldersDropDown
                  workspaceId={params.workspaceId}
                  onFoldersUpdate={onFoldersUpdate}
                  currentFolderId={currentFolderId}
                  onFolderSelect={handleFolderSelect}
                  icon={<FolderIcon className="h-4 w-4 mr-2 " />}
                />
            </div>

            <div>
              <h3 className="mb-2 mt-4 px-3 text-xs font-medium uppercase tracking-wider text-[#24222066]">
                People and Settings
              </h3>
              <motion.div className="grid gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
                <CollaboratorSearch
                  existingCollaborators={existingCollaborators.map(
                    (c) => c.uid
                  )}
                  currentUserUid={currentUserUid!}
                  onAddCollaborator={handleAddCollaborator}
                  onOpen={fetchExistingCollaborators}
                >
                  <motion.div
                    className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a] cursor-pointer"
                    onClick={() => setShowCollaborators(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    Add People
                  </motion.div>
                </CollaboratorSearch>
                <motion.div
                  className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a] cursor-pointer"
                  onClick={handleSettingsClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </motion.div>
              </motion.div>
            </div>
          </nav>
        </div>
        <div
          className="w-1 h-full absolute top-0 right-0 cursor-ew-resize"
          onMouseDown={handleMouseDown}
        />
      </motion.aside>

      {/* Modal for managing collaborators */}
      <AnimatePresence>
        {showCollaborators && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-96"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Go Pro */}
      <AnimatePresence>
        {showGoProModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-96"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-bold mb-4">Go Pro</h2>
              <ul className="list-disc list-inside mb-6">
                <li>Access to premium features</li>
                <li>Priority support</li>
                <li>More storage for your workspaces</li>
                <li>Collaborate with more team members</li>
                <li>Advanced analytics and insights</li>
              </ul>
              <GoProButton
                className="w-full nline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkspaceSidebar;