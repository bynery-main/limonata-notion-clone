"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import MainSidebar from "@/components/sidebar/main-sidebar";
import dynamic from "next/dynamic";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";

const DynamicResponsiveSidebar = dynamic(
  () => import("@/components/sidebar/responsive-sidebars"),
  { ssr: false }
);

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
  const [showDashboardSetup, setShowDashboardSetup] = useState(false);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
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

  const updateFoldersData = useCallback((newFoldersData: Folder[]) => {
    setFoldersData(newFoldersData);
  }, []);


  const memoizedUser = useMemo(() => user, [user]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const memoizedMainSidebar = useMemo(() => (
    <MainSidebar
      user={memoizedUser}
      setShowDashboardSetup={setShowDashboardSetup}
    />
  ), [memoizedUser, setShowDashboardSetup]);

  return (
    <FolderProvider>
      <div className="flex h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto">
      
        <div className="relative overflow-scroll font-inter text-xl font-semibold w-full">
          <div className="flex flex-col h-40 shrink-0 items-start border-b px-6 relative text-xl ">
            <div className="w-full mt-11">
              <Breadcrumbs onBreadcrumbsUpdate={updatePageTitle} />
            </div>
            {!isSettingsPage && (
              <>
              <div className="flex items-center w-full mt-2 ">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-4xl mr-3 focus:outline-none">
                      <span>{emoji}</span>
                    </button>
                    {pageTitle && (
                      <h1 className="text-4xl font-bold line-clamp-2">
                        {pageTitle.length > 50 ? `${pageTitle.slice(0, 50)}...` : pageTitle}
                      </h1>
                    )}
              </div>

            <p className="text-sm text-gray-600 mt-2 font-light">
              {pageDescription.length > 175 ? `${pageDescription.substring(0, 175)}...` : pageDescription}
            </p>
                      </>
            )}
                         </div>
 
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
      </div>
    </FolderProvider>
  );
};

export default Layout;
