"use client";

import React, { useState, useRef } from 'react';
import Link from "next/link";
import Picker from '@emoji-mart/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { BoxIcon, CalendarIcon, CirclePlusIcon, HomeIcon, LayoutGridIcon, LockIcon, MountainIcon, PackageIcon, PlusIcon, SettingsIcon, ShoppingCartIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import NativeNavigation from "./native-navigation";
import FoldersDropDown from "./folders-dropdown";

interface WorkspaceSidebarProps {
    params: { workspaceId: string };
    className?: string;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ params, className }) => {
    const [width, setWidth] = useState(256);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emoji, setEmoji] = useState<string>('🏔️');
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent) => {
        if (sidebarRef.current) {
            const newWidth = e.clientX;
            if (newWidth >= 200 && newWidth <= 500) {
                setWidth(newWidth);
            }
        }
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = () => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleEmojiSelect = (emoji: any) => {
        setEmoji(emoji.native);
        setShowEmojiPicker(false);
    };

    return (
        <aside
            ref={sidebarRef}
            style={{ width }}
            className="fixed inset-y-0 left-0 z-10 flex h-full flex-col border-r bg-white sm:static sm:h-auto sm:w-auto shadow-[0px_64px_64px_-32px_#6624008f] backdrop-blur-[160px] backdrop-brightness-[100%]"
        >
            <div className="flex h-20 shrink-0 items-center border-b px-6 relative">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center gap-2 font-semibold">
                    <span>{emoji}</span>
                    Biology
                </button>
                {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-20">
                        <Picker onEmojiSelect={handleEmojiSelect} />
                    </div>
                )}
                <span className="sr-only">Limonata</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <nav className="grid gap-4 text-sm font-medium">
                    <div>
                        <Collapsible className="space-y-2">
                            <div className="flex items-center justify-between space-x-4 px-3">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-[#24222066]">Exam 1</h3>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <PlusIcon className="h-4 w-4" />
                                        <span className="sr-only">Toggle</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="space-y-1">
                                <Link
                                    href="#"
                                    className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a]"
                                    prefetch={false}
                                >
                                    <CirclePlusIcon className="h-4 w-4" />
                                    New Resource
                                </Link>
                                <div className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a]">
                                    <LayoutGridIcon className="h-4 w-4" />
                                    AI Flashcards
                                </div>
                                <Link
                                    href="#"
                                    className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a]"
                                    prefetch={false}
                                >
                                    <BoxIcon className="h-4 w-4" />
                                    AI Study Guide
                                </Link>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                    <div>
                        <Button variant="ghost" size="sm" className="flex items-center">
                            <div className="flex">
                                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#24222066]">Add Assessment</h3>
                                <PlusIcon className="h-4 w-4 relative" />
                            </div>
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </div>
                    <div>
                        <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[#24222066]">Settings and People</h3>
                        <div className="grid gap-1">
                            {[
                                { icon: <UsersIcon className="h-4 w-4" />, text: "People" },
                                { icon: <UserPlusIcon className="h-4 w-4" />, text: "Add People" },
                                { icon: <SettingsIcon className="h-4 w-4" />, text: "Settings" },
                                { icon: <LockIcon className="h-4 w-4" />, text: "Security" },
                            ].map((item, index) => (
                                <Link
                                    key={index}
                                    href="#"
                                    className="flex items-center gap-3 px-5 py-4 text-[#2422208f] transition-colors hover:bg-[#2422200a]"
                                    prefetch={false}
                                >
                                    {item.icon}
                                    {item.text}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>
            <div
                className="w-1 h-full absolute top-0 right-0 cursor-ew-resize"
                onMouseDown={handleMouseDown}
            />
            <NativeNavigation params={params} className={twMerge('my-2', className)} />
            <FoldersDropDown workspaceId={params.workspaceId} />
        </aside>
    );
}

export default WorkspaceSidebar;