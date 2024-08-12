"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import Picker from "@emoji-mart/react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ButtonsCard } from "@/components/ui/tailwindcss-buttons";
import { Icon, Settings, Share2Icon, ShareIcon } from "lucide-react";
import Image from "next/image";
import FoldersDropDown from "@/components/sidebar/folders-dropdown";
import WorkspaceSidebar, { WorkspaceSidebarProps } from "@/components/sidebar/workspace-sidebar";
import { FolderProvider, useFolder } from "@/contexts/FolderContext";
import { ChatComponent } from "@/components/chat/chat-component";
import AIChatComponent from "@/components/ai-tools/ai-chat-component";
import Link from 'next/link';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { IconClipboardCopy, IconFileBroken, IconSignature, IconTableColumn } from "@tabler/icons-react";
import { usePathname } from 'next/navigation';
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";


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


const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);


const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState<string>("🍋"); // Default emoji
  const [foldersData, setFoldersData] = useState<Folder[]>([]);

  const db = getFirestore();

  useEffect(() => {
    const fetchWorkspaceEmoji = async () => {
      const workspaceRef = doc(db, "workspaces", params.workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);

      if (workspaceSnap.exists()) {
        const data = workspaceSnap.data();
        if (data.emoji) {
          setEmoji(data.emoji);
        }
      }
    };

    fetchWorkspaceEmoji();
  }, [params.workspaceId, db]);

  const pathname = usePathname();
  const folderId = params.folderId || null;  // Extract the folderId from params


  const handleEmojiSelect = (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setShowEmojiPicker(!showEmojiPicker);
  };

  const updateFoldersData = (newFoldersData: Folder[]) => {
    setFoldersData(newFoldersData);
  };

  // Update the logic to display BentoGrid on any path that includes both workspaceId and folderId
  const showBentoGrid = pathname?.startsWith(`/dashboard/${params.workspaceId}`) ?? false;

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
      return (
        <div className="w-full h-48 flex items-center justify-center">
          <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
            <Image
              src="https://images.template.net/wp-content/uploads/2017/01/17002828/Word-Document-Resume-Template.jpg"
              alt="Image Placeholder"
              layout="fill"
              objectFit="cover"
              style={{ filter: 'blur(8px)' }}
            />
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              fontSize: '48px', 
              color: 'white' 
            }}>
              📄
            </div>
          </div>
        </div>
      );
    }
  };

  const items: any[] = [
    // your items here
  ];

  const setItems = (arg0: (prevItems: any) => any[]) => {
    throw new Error("Function not implemented.");
  };

  const handleFileUpload = (file: FileData) => {
    setItems((prevItems: any) => [
      ...prevItems,
      {
        title: file.name,
        description: "Uploaded file",
        header: <Skeleton />,
      },
    ]);
  };

  const onSendMessage = (workspaceId: string, query: string) => {
    // Your message sending logic here
    console.log(`Workspace ID: ${workspaceId}, Query: ${query}`);
  };

  return (
    <FolderProvider>
      <main className="flex w-full h-full z-10">
        <WorkspaceSidebar params={params} onFoldersUpdate={updateFoldersData} />
        <div className="relative overflow-scroll font-inter text-xl font-semibold w-full">
          
          <div className="flex h-40 shrink-0 items-center border-b px-6 relative text-xl">

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex mx-5 items-center gap-2 font-semibold"
            >
              <span>{emoji}</span>
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 z-20 text-4xl">
                <Picker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
            <div
              className="dark:boder-Neutrals-12/70
              border-l-[1px]
              w-full
              relative
              overflow-scroll
              font-inter
              text-4xl
              font-light
            "
            >
              <Breadcrumbs />
            </div>
          </div>
          {children}

          {showBentoGrid && (
            <BentoGrid className="max-w-7xl mx-auto p-4">
              {foldersData.flatMap((folder, folderIndex) =>
                folder.files.map((file, fileIndex) => (
                  <BentoGridItem
                    key={file.id}
                    title={file.name}
                    description={`In folder: ${folder.name}`}
                    header={getFilePreview(file)}
                    href={`/dashboard/${params.workspaceId}/${folder.id}/${file.id}`}
                    className={
                      (folderIndex * folder.files.length + fileIndex) % 7 === 3 || 
                      (folderIndex * folder.files.length + fileIndex) % 7 === 6 
                        ? "md:col-span-2" 
                        : ""
                    }
                  />
                ))
              )}
            </BentoGrid>
          )}

        </div>
        <div className="fixed bottom-0 right-0 flex flex-col items-center p-4 space-y-2 my-12 z-50">
          <AIChatComponent workspaceId={params.workspaceId} />
          <ChatComponent onSendMessage={onSendMessage} />
        </div>
      </main>
    </FolderProvider>
  );
};


export default Layout;
