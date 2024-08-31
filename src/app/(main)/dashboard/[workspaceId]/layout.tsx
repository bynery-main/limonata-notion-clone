"use client";
import React, { useEffect, useState } from "react";
import Picker from "@emoji-mart/react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Image from "next/image";

import WorkspaceSidebar, {
  WorkspaceSidebarProps,
} from "@/components/sidebar/workspace-sidebar";
import { FolderProvider, useFolder } from "@/contexts/FolderContext";
import { ChatComponent } from "@/components/chat/chat-component";
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
  const db = getFirestore();

  const { user } = useAuth();
  const currentUserId = user?.uid ?? "";
  // console.log("Current user ID:", currentUserId);

  const router = useRouter();

  useEffect(() => {
    const getWorkspaceData = async () => {
      const workspaceRef = doc(db, "workspaces", params.workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);
      const data = workspaceSnap.data();
      console.log("Workspace data:", data);
      return data;
    };

    const validateUser = async () => {
      const data = await getWorkspaceData();

      if (
        !data?.owners.includes(currentUserId) &&
        !data?.collaborators.includes(currentUserId)
      ) {
        router.push("/login");
      }
    };

    const fetchWorkspaceEmoji = async () => {
      const data = await getWorkspaceData();

      if (data!.exists()) {
        if (data!.emoji) {
          setEmoji(data!.emoji);
        }
      }
    };

    validateUser();
    fetchWorkspaceEmoji();
  }, [params.workspaceId, db, currentUserId]);

  const pathname = usePathname();

  const getFolderId = (path: string): string | null => {
    const segments = path.split("/").filter(Boolean);

    if (segments.length === 3) {
      return segments[2];
    } else if (segments.length > 3) {
      const thirdSegment = segments[2];
      if (
        !["quizzes", "decks", "studyguides", "settings"].includes(thirdSegment)
      ) {
        return thirdSegment;
      }
    }

    return null;
  }; // Extract the folderId from params

  const isFullBentoGrid = (path: string): boolean => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 3) {
      return false;
    } else if (segments.length > 3) {
      const thirdSegment = segments[2];
      if (
        !["quizzes", "decks", "studyguides", "settings"].includes(thirdSegment)
      ) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const fullestBentoGrid = isFullBentoGrid(pathname || "");
    setFullBentoGrid(fullestBentoGrid);
    console.log("Full Bento Grid:", fullestBentoGrid);
    console.log("fullBenotGrid", fullBentoGrid);
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
    // console.log("Breadcrumb items received:", breadcrumbItems);
    if (breadcrumbItems.length > 0) {
      const newTitle = breadcrumbItems[breadcrumbItems.length - 1].label;
      // console.log("Setting new page title:", newTitle);
      setPageTitle(newTitle);
    } else {
      // console.log("No breadcrumb items received");
    }
  };

  // Update the logic to display BentoGrid on any path that includes both workspaceId and folderId
  const showBentoGrid =
    pathname?.startsWith(`/dashboard/${params.workspaceId}`) ?? false;

  const getFilePreview = (file: FileData) => {
    if (!file || !file.name) {
      return (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200">
          <span className="text-4xl">📄</span>
        </div>
      );
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const pdfExtensions = ["pdf"];
    const docExtensions = ["doc", "docx"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac"];
    const videoExtensions = ["mp4", "avi", "mov", "wmv"];

    if (imageExtensions.includes(fileExtension || "")) {
      return (
        <div className="w-full h-48 relative">
          <Image
            src={file.url}
            alt={file.name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      );
    } else {
      let emoji = "📝"; // Default document emoji
      if (pdfExtensions.includes(fileExtension || "")) {
        emoji = "📕"; // PDF emoji
      } else if (docExtensions.includes(fileExtension || "")) {
        emoji = "📘"; // Word document emoji
      } else if (audioExtensions.includes(fileExtension || "")) {
        emoji = "🎵"; // Audio file emoji
      } else if (videoExtensions.includes(fileExtension || "")) {
        emoji = "🎥"; // Video file emoji
      } else if (!fileExtension) {
        emoji = "📝"; // Document with pencil emoji for no extension
      }

      return (
        <div className="w-full h-48 flex items-center justify-center">
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "200px",
              overflow: "hidden",
            }}
          >
            <Image
              src="https://images.template.net/wp-content/uploads/2017/01/17002828/Word-Document-Resume-Template.jpg"
              alt="Image Placeholder"
              layout="fill"
              objectFit="cover"
              style={{ filter: "blur(8px)" }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "48px",
                color: "white",
              }}
            >
              {emoji}
            </div>
          </div>
        </div>
      );
    }
  };


  const onSendMessage = (workspaceId: string, query: string) => {
    // Your message sending logic here
    // console.log(`Workspace ID: ${workspaceId}, Query: ${query}`);
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
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-4xl mr-3 focus:outline-none"
              >
                <span>{emoji}</span>
              </button>
              {pageTitle && <h1 className="text-4xl font-bold">{pageTitle}</h1>}
              {showEmojiPicker && (
                <div className="absolute top-full left-6 mt-2 z-20">
                  <Picker onEmojiSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
          </div>
          {children}

          {showBentoGrid && (
            <BentoGrid className="max-w-7xl mx-auto p-4">
              {foldersData.flatMap((folder, folderIndex) =>
                fullBentoGrid || folder.id === folderId
                  ? folder.files.map((file, fileIndex) => (
                      <BentoGridItem
                        key={file.id}
                        title={file.name}
                        description={`In folder: ${folder.name}`}
                        header={getFilePreview(file)}
                        href={`/dashboard/${params.workspaceId}/${folder.id}/${file.id}`}
                        className={
                          (folderIndex * folder.files.length + fileIndex) %
                            7 ===
                            3 ||
                          (folderIndex * folder.files.length + fileIndex) %
                            7 ===
                            6
                            ? "md:col-span-2"
                            : ""
                        }
                      />
                    ))
                  : []
              )}
            </BentoGrid>
          )}
        </div>
        <div className="fixed bottom-0 right-0 flex flex-col items-center p-4 space-y-2 my-12 z-50">
          <AIChatComponent
            workspaceId={params.workspaceId}
            userId={currentUserId}
          />
          <ChatComponent onSendMessage={onSendMessage} userId={currentUserId} />
        </div>
      </main>
    </FolderProvider>
  );
};

export default Layout;
