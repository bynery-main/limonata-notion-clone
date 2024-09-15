"use client";
import React, { useEffect, useState } from "react";
import Picker from "@emoji-mart/react";
import { BentoGrid } from "@/components/BentoGrid/bento-grid";
import Image from "next/image";

import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { FolderProvider } from "@/contexts/FolderContext";
import ChatComponent from "@/components/chat/chat-component";
import AIChatComponent from "@/components/ai-tools/ai-chat-component";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { useRouter } from "next/navigation";

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
  const [fullBentoGrid, setFullBentoGrid] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const db = getFirestore();

  const { user, loading } = useAuth();
  const currentUserId = user?.uid ?? "";

  const router = useRouter();

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

  return (
    <FolderProvider>
      <main className="flex w-full h-full z-10">
        <WorkspaceSidebar params={params} onFoldersUpdate={updateFoldersData} />
        <div className="relative overflow-scroll font-inter text-xl font-semibold w-full">
          <div className="flex flex-col h-40 shrink-0 items-start border-b px-6 relative text-xl">
            <div className="w-full mt-8 ">
              <Breadcrumbs onBreadcrumbsUpdate={updatePageTitle} />
            </div>
            <div className="flex items-center w-full mt-2">
              {!isSettingsPage && (
                <>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-4xl mr-3 focus:outline-none">
                    <span>{emoji}</span>
                  </button>
                  {pageTitle && <h1 className="text-4xl font-bold">{pageTitle}</h1>}
                </>
              )}
            </div>
          </div>
          {children}

          {showBentoGrid && folderId && (
            <BentoGrid className="max-w-7xl mx-auto p-4" workspaceId={params.workspaceId} folderId={folderId}/>
          )}

          {showBentoGrid && !folderId && (
            <BentoGrid className="max-w-7xl mx-auto p-4" workspaceId={params.workspaceId} />
          )}

        </div>
        <div className="fixed bottom-0 right-0 flex flex-col items-center p-4 my-12 z-50">
          <AIChatComponent workspaceId={params.workspaceId} userId={currentUserId} onOpenAITutor={handleOpenAITutor}/>
          <ChatComponent workspaceId={params.workspaceId} userId={currentUserId} isChatVisible={isChatVisible} setIsChatVisible={setIsChatVisible} />
        </div>
      </main>
    </FolderProvider>
  );
};

export default Layout;
