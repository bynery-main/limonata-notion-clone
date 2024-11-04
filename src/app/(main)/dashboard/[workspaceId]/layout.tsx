"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BentoGrid } from "@/components/BentoGrid/bento-grid";
import { FolderProvider } from "@/contexts/FolderContext";
import ChatComponent from "@/components/chat/chat-component";
import AIChatComponent from "@/components/ai-tools/ai-chat-component";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { useRouter } from "next/navigation";
import ResponsiveSidebar from "@/components/sidebar/responsive-sidebars";
import FileUploader from "@/components/drag-n-drop/drag-n-drop"; // Import the new FileUploader component
import { Link, Pencil, Search, SearchIcon, SearchSlash, SearchX, Share, Share2, UserPlusIcon, X } from "lucide-react";
import CollaboratorSearch from "@/components/collaborator-setup/collaborator-search";
import { fetchUserEmailById } from "@/lib/db/users/get-users";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import NoCreditsModal from '@/components/subscribe/no-credits-modal';
import { PricingPage } from "@/components/subscribe/pricing";
import GoProButton from "@/components/subscribe/subscribe-button";
import { AnimatePresence, motion } from "framer-motion";
import NewNoteModal from "@/components/create-note-modal/create-note-modal";
import AblySpacesProvider from "@/components/ably/spaces-provider";
import LiveCursors from "@/components/ably/live-cursors";
import OnlineCollaborators from "@/components/ably/online-collaborators";

interface FileData {
  id: string;
  name: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

interface BreadcrumbItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState<string>("🍋");
  const [foldersData, setFoldersData] = useState<Folder[]>([]);
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageDescription, setPageDescription] = useState<string>("Welcome to your workspace dashboard");
  const [fullBentoGrid, setFullBentoGrid] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const db = getFirestore();
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [dragCounter, setDragCounter] = useState(0);
  const { user, loading } = useAuth();
  const currentUserId = user?.uid ?? "";
  const [isFileUploaderVisible, setIsFileUploaderVisible] = useState(false);
  const bentoGridRef = useRef<HTMLDivElement>(null);
  const [showGoProModal, setShowGoProModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [noCreditsModalData, setNoCreditsModalData] = useState({ remainingCredits: 0, creditCost: 0 });
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  useEffect(() => {
    const getWorkspaceData = async () => {
      const workspaceRef = doc(db, "workspaces", params.workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);
      const data = workspaceSnap.data();
      return data;
    };

    const validateUserAndFetchData = async () => {
      if (loading || !user) return;

      const data = await getWorkspaceData();

      if (!data) {
        console.error("Workspace data not found");
        router.push("/login");
        return;
      }

      if (!data.owners.includes(user.uid) && !data.collaborators.includes(user.uid)) {
        router.push("/login");
        return;
      }

      if (data.emoji) {
        setEmoji(data.emoji);
      }

      setFoldersData(data.folders || []);
      setPageDescription(data.description || "");

    };

    validateUserAndFetchData();
  }, [params.workspaceId, db, currentUserId, loading, user, router]);

  const pathname = usePathname();
  const isSettingsPage = pathname?.endsWith("/settings");

  const getFolderId = (path: string): string | null => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 3) return segments[2];
    else if (segments.length > 3) {
      const thirdSegment = segments[2];
      if (!["quizzes", "decks", "studyguides", "settings"].includes(thirdSegment)) {
        return thirdSegment;
      }
    }
    return null;
  };

  const isFullBentoGrid = (path: string): boolean => {
    const segments = path.split("/").filter(Boolean);
    return segments.length > 3 && !["quizzes", "decks", "studyguides", "settings"].includes(segments[2]);
  };

  useEffect(() => {
    const fullestBentoGrid = isFullBentoGrid(pathname || "");
    setFullBentoGrid(fullestBentoGrid);
  }, [pathname]);

  const folderId = getFolderId(pathname || "");
  console.log("Extracted folderId:", folderId);

  const handleEmojiSelect = (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const updateFoldersData = (newFoldersData: Folder[]) => {
    setFoldersData(newFoldersData);
  };

  const updatePageTitle = (breadcrumbItems: BreadcrumbItem[]) => {
    if (breadcrumbItems.length > 0) {
      const newTitle = breadcrumbItems[breadcrumbItems.length - 1].label;
      setPageTitle(newTitle);
    }
  };

  const showBentoGrid = pathname?.startsWith(`/dashboard/${params.workspaceId}`) ?? false;

  const onSendMessage = (workspaceId: string, query: string) => {
    console.log(`Workspace ID: ${workspaceId}, Query: ${query}`);
  };

  const handleOpenAITutor = () => {
    setIsChatVisible(true);
  };

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes('Files')) {
      setIsFileUploaderVisible(true);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileUploaderVisible(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsFileUploaderVisible(false);
  }, []);

  useEffect(() => {
    const bentoGridElement = bentoGridRef.current;
    if (bentoGridElement) {
      bentoGridElement.addEventListener('dragenter', handleDragEnter);
      bentoGridElement.addEventListener('dragover', handleDragOver);
      bentoGridElement.addEventListener('drop', handleDrop);
      document.addEventListener('dragend', handleDragEnd);

      return () => {
        bentoGridElement.removeEventListener('dragenter', handleDragEnter);
        bentoGridElement.removeEventListener('dragover', handleDragOver);
        bentoGridElement.removeEventListener('drop', handleDrop);
        document.removeEventListener('dragend', handleDragEnd);
      };
    }
  }, [handleDragEnter, handleDragOver, handleDrop, handleDragEnd]);

  const handleFileUpload = (file: FileData) => {
    setUploadedFiles(prevFiles => [...prevFiles, file]);
    setIsFileUploaderVisible(false);
  };


  const [showShareMenu, setShowShareMenu] = useState(false);
  const [existingCollaborators, setExistingCollaborators] = useState<{ uid: string; email: string }[]>([]);
  const [newCollaborators, setNewCollaborators] = useState<{ uid: string; email: string }[]>([]);
  const currentUserUid = user?.uid || "";
  const collaboratorSearchRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  /*
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareButtonRef.current && 
          !shareButtonRef.current.contains(event.target as Node) &&
          shareMenuRef.current && 
          !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

*/
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

  const handleAddCollaborator = (user: { uid: string; email: string }) => {
    setNewCollaborators((prev) => [...prev, user]);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = () => {

    // Logic to copy link
  };

  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const checkIfPhone = () => {
      setIsPhone(window.innerWidth < 768);
    };

    checkIfPhone();
    window.addEventListener('resize', checkIfPhone);

    return () => window.removeEventListener('resize', checkIfPhone);
  }, []);


  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (user && user.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setSubscriptionStatus(userData.subscriptionStatus || 'free');
          } else {
            console.log('No such user document!');
            setSubscriptionStatus('free');
          }
        } catch (error) {
          console.error('Error fetching subscription status:', error);
          setSubscriptionStatus('free');
        }
      }
    };

    fetchSubscriptionStatus();
  }, [user, db]);

  const handleGoProClick = () => {
    setShowGoProModal(true);
  };
  
  const handleShowNoCreditsModal = (remainingCredits: number, creditCost: number) => {
    setNoCreditsModalData({ remainingCredits, creditCost });
    setShowNoCreditsModal(true);
  };
  const handleNewNoteClick = () => {
    setIsNewNoteModalOpen(true);
  };

  const handleCreateNote = (name: string, folderId: string) => {
    // Implement the logic to create a new note
    console.log(`Creating new note: ${name} in folder: ${folderId}`);
    // You would typically make an API call or update your state here
  };
  return (
    <FolderProvider>
       <AblySpacesProvider workspaceId={params.workspaceId}>
      <div className="flex h-screen overflow-show z-1000">
        {isPhone ? (
          <ResponsiveSidebar 
            user={user} 
            workspaceId={params.workspaceId} 
            onFoldersUpdate={updateFoldersData} 
          />
        ) : (
          <WorkspaceSidebar 
            params={{ workspaceId: params.workspaceId }}
            onFoldersUpdate={updateFoldersData} 
            onGoProClick={handleGoProClick}
            onShowNoCreditsModal={handleShowNoCreditsModal}
          />
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="relative overflow-scroll font-inter text-xl font-semibold w-full">
            <div className="flex flex-col h-40 shrink-0 items-start border-b px-6 relative text-xl ">
              <div className="w-full mt-11">
                <Breadcrumbs onBreadcrumbsUpdate={updatePageTitle} />
              </div>
              {!isSettingsPage && (
                <>
                  <div className="flex items-center justify-between w-full mt-2">
                    <div className="flex items-center">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-4xl mr-3 focus:outline-none">
                        <span>{emoji}</span>
                      </button>
                      {pageTitle && (
                        <h1 className="text-4xl font-bold line-clamp-2">
                          {pageTitle.length > 50 ? `${pageTitle.slice(0, 50)}...` : pageTitle}
                        </h1>
                      )}
                    </div>
                    <div className="flex items-end ml-auto">
                    <button 
                      onClick={handleNewNoteClick} 
                      className="p-[1px] relative block mx-2">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#C66EC5] to-[#FC608D] rounded-full" />
                      <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center">
                        <Pencil className="w-4 h-4 mr-2" />
                        New Note
                      </div>
                    </button>
                      <button 
                        ref={shareButtonRef}
                        onClick={handleShare} 
                        className="p-[1px] relative block mx-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                        <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center">
                          <Share2 className="w-4 h-4 mr-2" />
                          Invite Collaborators
                        </div>
                      </button>
                      {showShareMenu && (
                        <div ref={shareMenuRef} className="absolute bottom-0 right-40 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <CollaboratorSearch
                              existingCollaborators={existingCollaborators.map(c => c.uid)}
                              currentUserUid={currentUserUid}
                              onAddCollaborator={handleAddCollaborator}
                              onOpen={fetchExistingCollaborators}
                              workspaceId={params.workspaceId}
                            >
                              <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer whitespace-nowrap">
                                <Search className="mr-3 h-5 w-5"/>
                                Search Collaborators
                              </div>
                            </CollaboratorSearch>
                            <div
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 hover:text-gray-300 cursor-not-allowed"
                              onClick={handleCopyLink}
                              title="Soon..."
                            >
                              <Link className="mr-3 h-5 w-5" />
                              Copy link
                            </div>
                          </div>
                        </div>
                      )}
                      <OnlineCollaborators />
                    </div>

                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2 font-light">
                    {pageDescription.length > 175 ? `${pageDescription.substring(0, 175)}...` : pageDescription}
                  </p>
                </>
                
              )}
              
            </div>
            <LiveCursors />
            {children}
            {!isSettingsPage && (
              <>
                <div ref={bentoGridRef}>
                  {showBentoGrid && folderId && (
                    <BentoGrid className="max-w-7xl mx-auto p-4" workspaceId={params.workspaceId} folderId={folderId}/>
                  )}
                  {showBentoGrid && !folderId && (
                    <BentoGrid className="max-w-7xl mx-auto p-4" workspaceId={params.workspaceId} />
                  )}
                </div>
                <FileUploader
                  workspaceId={params.workspaceId}
                  db={db}
                  onFileUpload={handleFileUpload}
                  isVisible={isFileUploaderVisible}
                  onClose={() => setIsFileUploaderVisible(false)}
                />
              </>
            )}
            <div className="fixed bottom-0 right-0 flex flex-col items-center p-4 my-12 z-50">
              <AIChatComponent workspaceId={params.workspaceId} userId={currentUserId} onOpenAITutor={handleOpenAITutor}/>
              <ChatComponent workspaceId={params.workspaceId} userId={currentUserId} isChatVisible={isChatVisible} setIsChatVisible={setIsChatVisible} />
            </div>
          </div>
        </main>
                {/* Go Pro Modal */}
                <AnimatePresence>
          {showGoProModal && user && (
            <motion.div 
              className="fixed inset-0 z-[60] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowGoProModal(false)} />
              
              <motion.div 
                className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative z-10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button 
                  onClick={() => setShowGoProModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
                <div className="p-8">
                  <PricingPage />
                  <div className="flex justify-center items-center mt-8">
                    <GoProButton
                      className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                      userEmail={user.email || ''}
                      userId={user.uid}
                      subscriptionStatus={subscriptionStatus || 'free'}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        <NewNoteModal
          isOpen={isNewNoteModalOpen}
          onClose={() => setIsNewNoteModalOpen(false)}
          workspaceId={params.workspaceId}
          folders={foldersData}
        />
        </AnimatePresence>

        {/* No Credits Modal */}
        <AnimatePresence>
          {showNoCreditsModal && user && (
            <motion.div 
              className="fixed inset-0 z-[60] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowNoCreditsModal(false)} />
              
              <motion.div 
                className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative z-10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button 
                  onClick={() => setShowNoCreditsModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
                <div className="p-8">
                  <NoCreditsModal
                    remainingCredits={noCreditsModalData.remainingCredits}
                    creditCost={noCreditsModalData.creditCost}
                    onClose={() => setShowNoCreditsModal(false)}
                    userId={user.uid}
                    userEmail={user.email || undefined}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </AblySpacesProvider>
    </FolderProvider>
  );
}

export default Layout;