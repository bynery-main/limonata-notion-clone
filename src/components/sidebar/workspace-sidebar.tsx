import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import {
  SettingsIcon,
  UserPlusIcon,
  MessageSquare,
  X,
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
import { motion, AnimatePresence } from "framer-motion";
import FeedbackForm from "../feedback/feedback-form";
import {PricingPage} from "../subscribe/pricing";


export interface WorkspaceSidebarProps {
  params: { workspaceId: string };
  className?: string;
  onFoldersUpdate: (folders: Folder[]) => void;
  onGoProClick: () => void;
  onShowNoCreditsModal: (remainingCredits: number, creditCost: number) => void;
}


const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  params,
  className,
  onFoldersUpdate,
  onGoProClick, 
  onShowNoCreditsModal,
}) => {
  const router = useRouter();
  const [width, setWidth] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState<string>("🏔️");
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showGoProModal, setShowGoProModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [maxCredits, setMaxCredits] = useState<number>(150);
  const progressValue = credits !== null ? (credits / maxCredits) * 100 : 0;
  const [currentFlashcardDeckId, setCurrentFlashcardDeckId] = useState<string | null>(null);
  const [currentQuizSetId, setCurrentQuizSetId] = useState<string | null>(null);
  const [currentStudyGuideId, setCurrentStudyGuideId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  
  // Add state for tracking mouse position
  const [isMouseNearSidebar, setIsMouseNearSidebar] = useState(false);

  const [existingCollaborators, setExistingCollaborators] = useState<
    { uid: string; email: string }[]
  >([]);
  const [newCollaborators, setNewCollaborators] = useState<
    { uid: string; email: string }[]
  >([]);

  const functions = getFunctions();
  const db = getFirestore();
  const manageCollaborators = httpsCallable(functions, "manageCollaborators");
  const modalRef = useRef<HTMLDivElement>(null);

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
        const data = docSnapshot.data();
        setWorkspaceName(data.name || null);
        setEmoji(data.emoji || "🏔️");
        fetchExistingCollaborators();
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

  const handleWorkspaceNameClick = () => {
    console.log("Navigating to Workspace root path");
    router.push(`/dashboard/${params.workspaceId}`);
  };
  const handleFolderSelect = (folder: Folder) => {
    console.log("Folder selected:", folder.id);
    setCurrentFolderId(folder.id);
    //router.push(`/dashboard/${params.workspaceId}/${folder.id}`);
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
        setCredits(userData?.credits || 0);
        setSubscriptionStatus(userData?.subscriptionStatus || "inactive");
        setTier(userData?.tier || "free");
        setMaxCredits(userData?.tier === "pro" ? 1000 : 150); // Changed from 100 to 150 for free tier
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

  useEffect(() => {
    if (!currentUserUid) return;

    const userDocRef = doc(db, "users", currentUserUid);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setCredits(userData?.credits || 0);
        setSubscriptionStatus(userData?.subscriptionStatus || "inactive");
        setTier(userData?.tier || "free");
        setMaxCredits(userData?.tier === "pro" ? 1000 : 150);
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);




  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowGoProModal(false);
      }
    };

    if (showGoProModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGoProModal]);

  // Modify the useEffect for mouse movement detection
  useEffect(() => {
    // Track if the mouse is over the sidebar
    let isOverSidebar = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Increase the detection area to 100px from the left edge (up from 50px)
      const isNear = e.clientX <= 100;
      
      if (isNear && !isSidebarVisible) {
        // Show sidebar when mouse approaches the edge
        setIsSidebarVisible(true);
        setIsMouseNearSidebar(true);
      }
    };
    
    // Add event listeners for the sidebar element
    const handleSidebarMouseEnter = () => {
      isOverSidebar = true;
    };
    
    const handleSidebarMouseLeave = () => {
      isOverSidebar = false;
      // Only hide the sidebar if the mouse has left it
      setIsSidebarVisible(false);
      setIsMouseNearSidebar(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Add event listeners to the sidebar if it exists
    if (sidebarRef.current) {
      sidebarRef.current.addEventListener('mouseenter', handleSidebarMouseEnter);
      sidebarRef.current.addEventListener('mouseleave', handleSidebarMouseLeave);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      
      // Clean up sidebar event listeners
      if (sidebarRef.current) {
        sidebarRef.current.removeEventListener('mouseenter', handleSidebarMouseEnter);
        sidebarRef.current.removeEventListener('mouseleave', handleSidebarMouseLeave);
      }
    };
  }, [isSidebarVisible, sidebarRef.current]); // Add dependencies to ensure event listeners are updated

  // Add a function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  // Add a new useEffect that runs once on component mount to ensure sidebar starts hidden
  useEffect(() => {
    // Set sidebar to hidden on initial load
    setIsSidebarVisible(false);
  }, []);

  return (
    <>
      <aside 
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-10 flex h-screen w-72 overflow-hidden flex-col border-r bg-white/70 backdrop-filter backdrop-blur-md sm:static shadow-lg rounded-tr-3xl rounded-br-3xl transition-transform duration-300 ${
          isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 shrink-0 items-center border-b border-white/20 px-6 relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center gap-2 font-semibold"
          >
            <span>{emoji}</span>
            <div onClick={handleWorkspaceNameClick}> {workspaceName} </div>
          </button>
          {showEmojiPicker && (
            <div className="fixed top-20 left-72 z-50">
            {/* I'll disable the Emoji Picker for now due to layout issues
              <Picker onEmojiSelect={handleEmojiSelect} />
              */}
            </div>
          )}
          <span className="sr-only">Limonata</span>
        </div>

        <SyncWorkspaceButton
        className="mx-4 shadow-lg bg-white/80 backdrop-filter backdrop-blur-sm"
        workspaceId={params.workspaceId}
        onShowNoCreditsModal={onShowNoCreditsModal}
      />



        {tier === "free" && (
          <>
            <Button
              onClick={onGoProClick}
              className="mx-4 mt-4 shadow-lg inline-flex h-10 animate-shimmer items-center justify-center rounded-md border border-slate-800/70 bg-[linear-gradient(110deg,#000103cc,45%,#1e2631cc,55%,#000103cc)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              Go Pro
            </Button>


            <div className="mx-4 mt-2">
              <motion.div
                className="bg-gray-200/80 rounded-full overflow-show"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
              >
                <motion.div
                  className="h-1 bg-gray-500/90 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              <p className="text-xs text-center mt-1 text-gray-600">
                {credits} / 150 credits remaining
              </p>
            </div>
          </>
        )}

        {tier === "pro" && (
          <>
            {subscriptionStatus === "active_pending_cancellation" && (
              <Button
                onClick={onGoProClick}
                className="mx-4 mt-4 shadow-lg inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                Resubscribe
              </Button>
            )}
            <div className="mx-4 mt-2">
              <motion.div
                className="bg-gray-200 rounded-full overflow-show"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
              >
                <motion.div
                  className="h-1 bg-gray-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              <p className="text-xs text-center mt-1 text-gray-400">
                {credits} / 1000 credits remaining
              </p>
            </div>
          </>
        )}        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h3 className="mb-2 mt-4 px-3 text-xs font-medium uppercase tracking-wider text-[#24222099] overflow-show">
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
          <nav className="grid gap-4 text-sm font-medium mt-6 z-100">
            <FoldersDropDown
              workspaceId={params.workspaceId}
              onFoldersUpdate={onFoldersUpdate}
              currentFolderId={currentFolderId}
              onFolderSelect={handleFolderSelect}
            />

            <div>
              <h3 className="mb-2 mt-4 px-3 text-xs font-medium uppercase tracking-wider text-[#24222099]">
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
                    className="flex items-center gap-3 px-5 py-4 text-[#242220aa] transition-colors hover:bg-[#2422201a] hover:backdrop-blur-lg rounded-md cursor-pointer"
                    onClick={() => setShowCollaborators(true)}
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    Add People
                  </div>
                </CollaboratorSearch>
                <div
                  className="flex items-center gap-3 px-5 py-4 text-[#242220aa] transition-colors hover:bg-[#2422201a] hover:backdrop-blur-lg rounded-md cursor-pointer"
                  onClick={handleSettingsClick}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Workspace Settings
                </div>
                <div>
                <div
                  className="flex items-center gap-3 px-5 py-4 text-[#242220aa] transition-colors hover:bg-[#2422201a] hover:backdrop-blur-lg rounded-md cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <FeedbackForm />
                </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Improve the tab when sidebar is hidden */}
      {!isSidebarVisible && (
        <div 
          className="fixed top-1/2 left-0 z-10 bg-white/80 backdrop-filter backdrop-blur-sm p-3 rounded-r-md shadow-md cursor-pointer transform -translate-y-1/2 transition-opacity duration-300 hover:bg-white/90"
          onClick={toggleSidebar}
          style={{ width: '40px', height: '60px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      )}

      <AnimatePresence>
        {showGoProModal && (
          <motion.div 
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowGoProModal(false)} />
            
            <motion.div 
              className="bg-white/90 backdrop-filter backdrop-blur-md rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              ref={modalRef}
            >
              <button 
                onClick={() => setShowGoProModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <div className="p-8">
                <PricingPage />
                <div className="flex justify-center items-center mt-8 mb-16">
                  <GoProButton
                    className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                    userEmail={currentUserEmail!}
                    userId={currentUserUid!}
                    subscriptionStatus={subscriptionStatus}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkspaceSidebar;