"use client";

import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import Picker from '@emoji-mart/react';
import { ButtonsCard } from "@/components/ui/tailwindcss-buttons";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState<string>('🍋'); // Default emoji

  const handleEmojiSelect = (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <main className="flex w-full h-full">
      <WorkspaceSidebar params={params} />
      <div className="flex h-20 shrink-0 items-center border-b px-6 relative text-xl">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex mx-5 items-center gap-2 font-semibold">
                    <span>{emoji}</span>
                </button>
                {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-20">
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
        text-xl
        font-semibold
      "
      >
        {children}

        </div>
      </div>

    </main>
  );
};

export default Layout;
