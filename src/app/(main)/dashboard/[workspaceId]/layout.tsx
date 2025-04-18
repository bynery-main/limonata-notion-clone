"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BentoGrid } from "@/components/BentoGrid/bento-grid";
import { FolderProvider } from "@/contexts/FolderContext";
import ChatComponent from "@/components/chat/chat-component";
import AIChatComponent from "@/components/ai-tools/ai-chat-component";
import { doc, getDoc, getFirestore, updateDoc, setDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { useRouter } from "next/navigation";
import ResponsiveSidebar from "@/components/sidebar/responsive-sidebars";
import FileUploader from "@/components/drag-n-drop/drag-n-drop"; // Import the new FileUploader component
import { Link, Pencil, Search, SearchIcon, SearchSlash, SearchX, Share, Share2, UserPlusIcon, X, ArrowLeftCircleIcon, Menu } from "lucide-react";
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
import { BookOpen, FileText, Layout as LayoutIcon, HelpCircle } from "lucide-react";
import { IconLayout } from "@tabler/icons-react";
import TabBar from "@/components/tab-bar";
import FolderFilterTabs from "@/components/folder-filter/folder-filter-tabs";
import { toast } from "react-hot-toast";

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
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const pathname = usePathname();
  const isSettingsPage = pathname?.endsWith("/settings");
  const isWorkspaceRoot = pathname === `/dashboard/${params.workspaceId}`;
  const [activeFilterFolder, setActiveFilterFolder] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [chatShouldOpen, setChatShouldOpen] = useState(false);
  
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
      if (isWorkspaceRoot) {
        setPageTitle(data.name || "Workspace");
      }
    };

    validateUserAndFetchData();
  }, [params.workspaceId, db, currentUserId, loading, user, router, isWorkspaceRoot]);

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
    setChatShouldOpen(true);
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
  useEffect(() => {
    const bentoGridElement = bentoGridRef.current;
    if (bentoGridElement) {
      // Add a check to see if the target is inside the BentoGrid element
      const handleDragEnterWithCheck = (e: DragEvent) => {
        const isFileUploadArea = e.target && 
          (e.target as Element).closest('.group\\/file');
        
        // Skip event handling if it's within a file upload area
        if (isFileUploadArea) {
          return;
        }
        
        handleDragEnter(e);
      };
  
      bentoGridElement.addEventListener('dragenter', handleDragEnterWithCheck);
      bentoGridElement.addEventListener('dragover', handleDragOver);
      bentoGridElement.addEventListener('drop', handleDrop);
      document.addEventListener('dragend', handleDragEnd);
  
      return () => {
        bentoGridElement.removeEventListener('dragenter', handleDragEnterWithCheck);
        bentoGridElement.removeEventListener('dragover', handleDragOver);
        bentoGridElement.removeEventListener('drop', handleDrop);
        document.removeEventListener('dragend', handleDragEnd);
      };
    }
  }, [handleDragEnter, handleDragOver, handleDrop, handleDragEnd]);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [existingCollaborators, setExistingCollaborators] = useState<{ uid: string; email: string }[]>([]);
  const [newCollaborators, setNewCollaborators] = useState<{ uid: string; email: string }[]>([]);
  const currentUserUid = user?.uid || "";
  const collaboratorSearchRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const fetchExistingCollaborators = async () => {
    if (!params.workspaceId) return;
    
    try {
      const workspaceRef = doc(db, "workspaces", params.workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);

      if (workspaceSnap.exists()) {
        const data = workspaceSnap.data();
        const collaborators = data.collaborators || [];
        
        // If no change in collaborator IDs, don't trigger a re-render
        const currentCollaboratorIds = existingCollaborators.map(c => c.uid);
        
        // Check if arrays are identical (same elements, possibly different order)
        if (currentCollaboratorIds.length === collaborators.length && 
            currentCollaboratorIds.every((id: string) => collaborators.includes(id)) &&
            collaborators.every((id: string) => currentCollaboratorIds.includes(id))) {
          // No change, avoid re-render
          return;
        }

        const collaboratorsWithEmails = await Promise.all(
          collaborators.map(async (uid: string) => {
            const email = await fetchUserEmailById(uid);
            return { uid, email };
          })
        );

        setExistingCollaborators(collaboratorsWithEmails);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast.error("Failed to load collaborators");
    }
  };

  useEffect(() => {
    // Fetch collaborators when the workspace ID changes or the user logs in
    if (params.workspaceId && !loading && user) {
      fetchExistingCollaborators();
    }
  }, [params.workspaceId, loading, user]);
  
  // Poll for changes every 5 seconds to ensure UI stays in sync with server
  useEffect(() => {
    if (!params.workspaceId || loading || !user) return;
    
    const interval = setInterval(() => {
      fetchExistingCollaborators();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [params.workspaceId, loading, user]);

  const handleAddCollaborator = (user: { uid: string; email: string }) => {
    // Update the collaborators state immediately for a responsive UI
    setNewCollaborators((prev) => {
      // Avoid adding duplicates
      if (prev.some(c => c.uid === user.uid)) return prev;
      return [...prev, user];
    });
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
    // Refresh the collaborator list when opening the share menu
    if (!showShareMenu) {
      fetchExistingCollaborators();
    }
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

  const tabs = [
    {
      id: "files",
      label: "Files",
      icon: <FileText className="w-4 h-4 mr-2" />,
    },
    {
      id: "decks",
      label: "Flashcards",
      icon: <IconLayout className="w-4 h-4 mr-2" />,
    },
    {
      id: "studyguides",
      label: "Study Guides",
      icon: <BookOpen className="w-4 h-4 mr-2" />,
    },
    {
      id: "quizzes",
      label: "Quizzes", 
      icon: <HelpCircle className="w-4 h-4 mr-2" />,
    }
  ];

  const [activeTab, setActiveTab] = useState("files");

  useEffect(() => {
    const handleCreateNewNote = () => {
      setIsNewNoteModalOpen(true);
    };
    
    document.addEventListener('create-new-note', handleCreateNewNote);
    
    return () => {
      document.removeEventListener('create-new-note', handleCreateNewNote);
    };
  }, []);

  const handleTitleEdit = () => {
    setEditedTitle(pageTitle);
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 10);
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() !== pageTitle) {
      try {
        const pathSegments = pathname?.split('/').filter(Boolean) || [];
        console.log("Path segments:", pathSegments);
        
        // Determine if we're updating workspace, folder, or file
        if (pathSegments.length === 2) {
          // We're at workspace root - update workspace name
          console.log("Updating workspace name");
          const workspaceRef = doc(db, "workspaces", params.workspaceId);
          await updateDoc(workspaceRef, {
            name: editedTitle.trim()
          });
          setPageTitle(editedTitle.trim());
          toast.success("Workspace title updated");
        } 
        else if (pathSegments.length >= 3) {
          // Extract folder ID and potential file ID
          const folderId = pathSegments[2];
          const fileId = pathSegments.length >= 4 ? pathSegments[3] : null;
          
          console.log("Folder ID:", folderId, "File ID:", fileId);
          
          // If we have a file ID, we're at file level
          if (fileId && pathSegments.length >= 4) {
            console.log("Attempting to update file with ID:", fileId, "in folder:", folderId);
            
            // Try to find the file in the folder's files subcollection
            try {
              const fileRef = doc(db, "workspaces", params.workspaceId, "folders", folderId, "files", fileId);
              const fileDoc = await getDoc(fileRef);
              
              if (fileDoc.exists()) {
                console.log("Found file in folder's files subcollection:", fileDoc.data());
                
                // Update the file name
                await updateDoc(fileRef, {
                  name: editedTitle.trim()
                });
                
                setPageTitle(editedTitle.trim());
                toast.success("File title updated");
                setIsEditingTitle(false);
                return;
              } else {
                console.log("File not found in folder's files subcollection");
              }
            } catch (fileError) {
              console.error("Error checking folder's files subcollection:", fileError);
            }
            
            // If not found in files subcollection, try notes subcollection
            try {
              console.log("Attempting to update note instead");
              const noteRef = doc(db, "workspaces", params.workspaceId, "folders", folderId, "notes", fileId);
              const noteDoc = await getDoc(noteRef);
              
              if (noteDoc.exists()) {
                console.log("Found note in folder's notes subcollection:", noteDoc.data());
                
                // Update the note name
                await updateDoc(noteRef, {
                  name: editedTitle.trim()
                });
                
                setPageTitle(editedTitle.trim());
                toast.success("Note title updated");
                setIsEditingTitle(false);
                return;
              } else {
                console.log("Not a note either");
              }
            } catch (noteError) {
              console.error("Error checking if ID is a note:", noteError);
            }
            
            toast.error("File or note not found");
          } 
          // Otherwise, we're at folder level
          else {
            console.log("Updating folder with ID:", folderId);
            
            const folderRef = doc(db, "workspaces", params.workspaceId, "folders", folderId);
            const folderDoc = await getDoc(folderRef);
            
            if (folderDoc.exists()) {
              console.log("Found folder in workspace's folders subcollection:", folderDoc.data());
              
              // Update the folder name
              await setDoc(folderRef, { name: editedTitle.trim() }, { merge: true });
              
              setPageTitle(editedTitle.trim());
              toast.success("Folder title updated");
              setIsEditingTitle(false);
              return;
            } else {
              console.log("Folder not found");
              toast.error("Folder not found");
            }
          }
        }
      } catch (error) {
        console.error("Error updating title:", error);
        toast.error("Failed to update title");
      }
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
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
            <>
              {/* Hover trigger area */}
              <div 
                className="absolute z-999 top-0 left-0 h-full w-16 z-40"
                onMouseEnter={() => {
                  console.log("Hover trigger entered");
                  setSidebarOpen(true);
                }}
              />
              
              <div 
                className={`h-full absolute z-50 transition-all duration-300 ease-in-out ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-[300px]'
                } hover:shadow-xl`}
                onMouseLeave={() => {
                  console.log("Sidebar left");
                  setSidebarOpen(false);
                }}
              >
                <WorkspaceSidebar 
                  params={{ workspaceId: params.workspaceId }}
                  onFoldersUpdate={updateFoldersData} 
                  onGoProClick={handleGoProClick}
                  onShowNoCreditsModal={handleShowNoCreditsModal}
                />
              </div>
            </>
          )}

          <main className="flex-1 overflow-y-auto">
            <div className="w-full">
              <div className="relative overflow-scroll font-inter text-xl font-semibold w-full">
                <div className="flex flex-col h-50 shrink-0 items-start pb-7 max-w-[95%] mx-auto px-1 relative text-xl">
                  <div className="w-full mt-8">
                    {!isWorkspaceRoot && !isSettingsPage && (
                      <Breadcrumbs onBreadcrumbsUpdate={updatePageTitle} />
                    )}
                  </div>
                  {!isSettingsPage && (
                    <>
                      <div className="flex items-center justify-between w-full mt-2 max-w-full mx-auto p-1">
                        <div className={`flex group relative ${!isDescriptionVisible ? 'border rounded-2xl p-3' : ''} transition-all duration-200`}>
                          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-3xl mr-3 focus:outline-none">
                            <span>{emoji}</span>
                          </button>
                          {pageTitle && (
                            <div className="flex items-center">
                              {isEditingTitle ? (
                                <input
                                  ref={titleInputRef}
                                  type="text"
                                  value={editedTitle}
                                  onChange={(e) => setEditedTitle(e.target.value)}
                                  onBlur={handleTitleSave}
                                  onKeyDown={handleTitleKeyDown}
                                  className="text-4xl font-light bg-transparent border-b border-gray-300 focus:outline-none focus:border-gray-500 w-full"
                                  maxLength={100}
                                />
                              ) : (
                                <h1 
                                  className="text-4xl font-light cursor-pointer"
                                  onClick={handleTitleEdit}
                                  title="Click to edit workspace title"
                                >
                                  {pageTitle.length > 50 ? `${pageTitle.slice(0, 50)}...` : pageTitle}
                                </h1>
                              )}
                              <button
                                onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <motion.div
                                  initial={{ rotate: 0 }}
                                  animate={{ rotate: isDescriptionVisible ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="m6 9 6 6 6-6"/>
                                  </svg>
                                </motion.div>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center ml-auto gap-2">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              <OnlineCollaborators user={user}/>
                              <button 
                                ref={shareButtonRef}
                                onClick={handleShare} 
                                className="p-[1px] relative block mx-2"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                                <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center">
                                  <Share2 className="w-4 h-4 md:mr-2" />
                                  <span className="hidden md:inline">Invite Collaborators</span>
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
                                        <span className="hidden md:inline">Search Collaborators</span>
                                        <span className="md:hidden">Search</span>
                                      </div>
                                    </CollaboratorSearch>
                                    <div
                                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 hover:text-gray-300 cursor-not-allowed"
                                      onClick={handleCopyLink}
                                      title="Soon..."
                                    >
                                      <Link className="mr-3 h-5 w-5" />
                                      <span className="hidden md:inline">Copy link</span>
                                      <span className="md:hidden">Copy</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <button 
                                onClick={handleNewNoteClick} 
                                className="p-[1px] relative block mx-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#C66EC5] to-[#FC608D] rounded-full" />
                                <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center">
                                  <svg 
                                    className="w-4 h-4 md:mr-2" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                  </svg>
                                  <span className="hidden md:inline">New Live Note</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {isDescriptionVisible && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-sm text-gray-600 font-medium px-1"
                          >
                            {pageDescription.length > 175 ? `${pageDescription.substring(0, 175)}...` : pageDescription}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                  
                </div>
                <LiveCursors user={user} workspaceId={params.workspaceId} />
                {children}

                <FileUploader
                  workspaceId={params.workspaceId}
                  db={db}
                  onFileUpload={handleFileUpload}
                  isVisible={isFileUploaderVisible}
                  onClose={() => setIsFileUploaderVisible(false)}
                />

                {!isSettingsPage && (
                  <>
                    <div className="max-w-[95%] mx-auto px-1" >
                      <TabBar 
                        tabs={tabs} 
                        activeTab={activeTab} 
                        onChange={setActiveTab} 
                      />
                      <FolderFilterTabs
                        folders={foldersData}
                        activeFolder={activeFilterFolder}
                        onFolderChange={setActiveFilterFolder}
                        isVisible={activeTab === "files" && foldersData.length > 0 && !folderId}
                      />
                    </div>
                    <div ref={bentoGridRef}>
                      {showBentoGrid && (
                        <BentoGrid 
                          className="max-w-[95%] mx-auto p-1" 
                          workspaceId={params.workspaceId}
                          folderId={folderId || undefined}
                          type={activeTab === "files" ? "files" : activeTab === "notes" ? "notes" : activeTab}
                          userId={currentUserId}
                          filterFolderId={activeFilterFolder}
                        />
                      )}
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className="fixed bottom-4 left-0 right-0 mx-auto flex flex-col justify-end items-center p-4 z-50 w-max">
                    <AIChatComponent workspaceId={params.workspaceId} userId={currentUserId} onOpenAITutor={handleOpenAITutor}/>
                  </div>
                </div>

                <div className="relative">
                  <ChatComponent 
                    workspaceId={params.workspaceId} 
                    userId={currentUserId} 
                    defaultOpen={chatShouldOpen} 
                  />
                </div>
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
          </AnimatePresence>

          <NewNoteModal
            isOpen={isNewNoteModalOpen}
            onClose={() => setIsNewNoteModalOpen(false)}
            workspaceId={params.workspaceId}
            folders={foldersData}
          />

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