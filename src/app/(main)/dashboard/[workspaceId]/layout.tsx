"use client";

import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import Picker from '@emoji-mart/react';
import { BentoGrid, BentoGridItem } from "../../../../components/ui/bento-grid";
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
  const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
  );
  const items = [
    {
      title: "The Dawn of Innovation",
      description: "Explore the birth of groundbreaking ideas and inventions.",
      header: <Skeleton />,
    },
    {
      title: "The Digital Revolution",
      description: "Dive into the transformative power of technology.",
      header: <Skeleton />,
    },
    {
      title: "The Art of Design",
      description: "Discover the beauty of thoughtful and functional design.",
      header: <Skeleton />,
    },
    {
      title: "The Power of Communication",
      description:
        "Understand the impact of effective communication in our lives.",
      header: <Skeleton />,
    },
    {
      title: "The Pursuit of Knowledge",
      description: "Join the quest for understanding and enlightenment.",
      header: <Skeleton />,
    },
    {
      title: "The Joy of Creation",
      description: "Experience the thrill of bringing ideas to life.",
      header: <Skeleton />,
    },
    {
      title: "The Spirit of Adventure",
      description: "Embark on exciting journeys and thrilling discoveries.",
      header: <Skeleton />,
    },
  ];
  return (
    <main className="flex w-full h-full">
      <WorkspaceSidebar params={params} />
      
      <div className="flex h-full relative text-xl flex-col mx-4">        <div className="flex h-20 shrink-0 items-center border-b px-6 relative text-xl fixed top-0 left-0 right-0">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex mx-5 items-center gap-2 font-semibold">
                      <span>{emoji}</span>
                  </button>
                  {showEmojiPicker && (
                      <div className="absolute top-full left-0 mt-2 z-20">
                          <Picker onEmojiSelect={handleEmojiSelect} />
                      </div>
                  )}
                  
          <div
          className="
          w-full
          relative
          overflow-scroll
          font-inter
          text-xl
          font-light">

          {children}
          </div>
        </div>
        <BentoGridDemo />     
      </div>

    </main>
  );
};

export default Layout;
