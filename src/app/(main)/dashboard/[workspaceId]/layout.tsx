"use client";

import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import Picker from '@emoji-mart/react';
import { BentoGrid, BentoGridItem } from "../../../../components/ui/bento-grid";
import { ButtonsCard } from "@/components/ui/tailwindcss-buttons";
import { Icon, Settings, Share2Icon, ShareIcon } from "lucide-react";

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
  const [emoji, setEmoji] = useState<string>('🍋'); // Default emoji
  const [foldersData, setFoldersData] = useState<Folder[]>([]);

  const handleEmojiSelect = (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setShowEmojiPicker(!showEmojiPicker);
  };
   function BentoGridDemo() {
    return (
      <BentoGrid className="max-w-4xl mx-auto">

        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            icon={item.icon}
            className={i === 3 || i === 6 ? "md:col-span-2" : ""}
          />
        ))}
      </BentoGrid>
    );
  }

  const items: any[] = [
    // your items here
  ];
  

  const updateFoldersData = (newFoldersData: Folder[]) => {
    setFoldersData(newFoldersData);
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
  
  return (
    <main className="flex w-full h-full z-10">
      <WorkspaceSidebar params={params} onFoldersUpdate={updateFoldersData} />
      <div className="relative overflow-scroll font-inter text-xl font-semibold">
      <div className="flex h-40 shrink-0 items-center border-b px-6 relative text-xl">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex mx-5 items-center gap-2 font-semibold">
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
      ">
        Unit 1: The Cell
        </div>
      </div>
        {children}
        <BentoGrid className="max-w-4xl mx-auto">
          {foldersData.flatMap(folder => 
            folder.files.map((file, i) => (
              <BentoGridItem
                key={file.id}
                title={file.name}
                description={`In folder: ${folder.name}`}
                header={<Skeleton />}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))
          )}
        </BentoGrid>
        </div>
      </main>
    );
  };

export default Layout;
function setItems(arg0: (prevItems: any) => any[]) {
  throw new Error("Function not implemented.");
}

