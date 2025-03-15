"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useOutsideClick from "@/hooks/use-outside-click";
import { Workspace } from "@/lib/db/workspaces/get-workspaces";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { UserIcon, UsersIcon, PlusIcon } from 'lucide-react';

interface WorkspaceCard extends Workspace {
  type: string;
}

interface CollaboratorInfo {
  id: string;
  displayName: string;
  photoURL: string;
}

interface WorkspaceDetailInfo {
  emoji: string;
  description: string;
  createdBy: {
    id: string;
    displayName: string;
    photoURL: string;
  };
  collaborators: CollaboratorInfo[];
}

interface ExpandableCardDemoProps {
  cards: WorkspaceCard[];
  onAddWorkspace: () => void;
  currentUser?: any;
}

// Add an index signature to the object type
const EmojiGradients: Record<string, {from: string, to: string}> = {
  // Work & Productivity
  '🚀': {from: '#FF5A5F', to: '#B762C1'}, // Rocket: Red to Purple
  '🏢': {from: '#3498DB', to: '#2ECC71'}, // Building: Blue to Green
  '💼': {from: '#34495E', to: '#7F8C8D'}, // Briefcase: Dark Blue to Gray
  '📈': {from: '#2ECC71', to: '#27AE60'}, // Chart Increasing: Green
  '📉': {from: '#E74C3C', to: '#C0392B'}, // Chart Decreasing: Red
  '📊': {from: '#2ECC71', to: '#3498DB'}, // Bar Chart: Green to Blue
  '📋': {from: '#ECF0F1', to: '#BDC3C7'}, // Clipboard: Light Gray
  '⏰': {from: '#E74C3C', to: '#C0392B'}, // Alarm Clock: Red
  '📅': {from: '#3498DB', to: '#2980B9'}, // Calendar: Blue
  '💡': {from: '#F1C40F', to: '#E67E22'}, // Lightbulb: Yellow to Orange
  
  // Creative & Design
  '🎨': {from: '#9B59B6', to: '#8E44AD'}, // Artist Palette: Purple
  '🖌️': {from: '#3498DB', to: '#2980B9'}, // Paintbrush: Blue
  '📷': {from: '#34495E', to: '#2C3E50'}, // Camera: Dark Blue
  '🎬': {from: '#E74C3C', to: '#C0392B'}, // Clapper Board: Red
  '🎵': {from: '#9B59B6', to: '#8E44AD'}, // Musical Note: Purple
  '🎮': {from: '#2C3E50', to: '#34495E'}, // Game Controller: Dark Blue
  '🎭': {from: '#F39C12', to: '#D35400'}, // Performing Arts: Orange
  
  // Nature & Environment
  '🌳': {from: '#27AE60', to: '#145A32'}, // Tree: Green
  '🌊': {from: '#3498DB', to: '#2980B9'}, // Wave: Blue
  '🌞': {from: '#F1C40F', to: '#F39C12'}, // Sun: Yellow to Orange
  '🌈': {from: '#3498DB', to: '#2ECC71'}, // Rainbow: Blue to Green
  '🌸': {from: '#FF5A5F', to: '#B762C1'}, // Cherry Blossom: Pink to Purple
  '🌵': {from: '#27AE60', to: '#145A32'}, // Cactus: Green
  
  // Fruits & Food
  '🍎': {from: '#E74C3C', to: '#C0392B'}, // Red Apple: Red
  '🍏': {from: '#2ECC71', to: '#27AE60'}, // Green Apple: Green
  '🍊': {from: '#F39C12', to: '#D35400'}, // Orange: Orange
  '🍋': {from: '#F1C40F', to: '#F39C12'}, // Lemon: Yellow to Orange
  '🍌': {from: '#F1C40F', to: '#F9E79F'}, // Banana: Yellow
  '🍉': {from: '#E74C3C', to: '#2ECC71'}, // Watermelon: Red to Green
  '🍇': {from: '#9B59B6', to: '#8E44AD'}, // Grapes: Purple
  '🍓': {from: '#E74C3C', to: '#C0392B'}, // Strawberry: Red
  '🥑': {from: '#27AE60', to: '#145A32'}, // Avocado: Green
  '🍍': {from: '#F1C40F', to: '#27AE60'}, // Pineapple: Yellow to Green
  '🍕': {from: '#E67E22', to: '#D35400'}, // Pizza: Orange
  '🍔': {from: '#E67E22', to: '#D35400'}, // Hamburger: Orange
  '🍦': {from: '#ECF0F1', to: '#BDC3C7'}, // Ice Cream: White to Light Gray
  '🍩': {from: '#E74C3C', to: '#C0392B'}, // Donut: Red
  '🍰': {from: '#FF5A5F', to: '#B762C1'}, // Cake: Pink to Purple
  
  // Study & Education
  '📚': {from: '#3498DB', to: '#E74C3C'}, // Books: Blue to Red
  '📝': {from: '#ECF0F1', to: '#BDC3C7'}, // Memo: Light Gray
  '📖': {from: '#3498DB', to: '#2980B9'}, // Open Book: Blue
  '🔬': {from: '#3498DB', to: '#2C3E50'}, // Microscope: Blue to Dark Blue
  '🧪': {from: '#9B59B6', to: '#8E44AD'}, // Test Tube: Purple
  '🧮': {from: '#E67E22', to: '#D35400'}, // Abacus: Orange
  '🎓': {from: '#2C3E50', to: '#34495E'}, // Graduation Cap: Dark Blue
  '✏️': {from: '#F1C40F', to: '#F39C12'}, // Pencil: Yellow to Orange
  '📏': {from: '#BDC3C7', to: '#7F8C8D'}, // Ruler: Gray
  '🧠': {from: '#E74C3C', to: '#C0392B'}, // Brain: Red
  '🔍': {from: '#34495E', to: '#95A5A6'}, // Magnifier: Dark Blue to Gray
  
  // Technology & Communication
  '💻': {from: '#34495E', to: '#2C3E50'}, // Laptop: Dark Blue
  '📱': {from: '#BDC3C7', to: '#7F8C8D'}, // Mobile Phone: Gray
  '⌨️': {from: '#34495E', to: '#2C3E50'}, // Keyboard: Dark Blue
  '🖥️': {from: '#34495E', to: '#2C3E50'}, // Desktop Computer: Dark Blue
  '📡': {from: '#7F8C8D', to: '#34495E'}, // Satellite Antenna: Gray to Dark Blue
  '🔋': {from: '#27AE60', to: '#145A32'}, // Battery: Green
  '💾': {from: '#3498DB', to: '#2980B9'}, // Floppy Disk: Blue
  '📧': {from: '#3498DB', to: '#2980B9'}, // E-Mail: Blue
  
  // Symbols & Abstract
  '❤️': {from: '#E74C3C', to: '#C0392B'}, // Red Heart: Red
  '⭐': {from: '#F1C40F', to: '#F39C12'}, // Star: Yellow to Orange
  '🌟': {from: '#FFD700', to: '#FF8C00'}, // Glowing Star: Gold to Dark Orange
  '✨': {from: '#F1C40F', to: '#F39C12'}, // Sparkles: Yellow to Orange
  '🎯': {from: '#E74C3C', to: '#9B59B6'}, // Target: Red to Purple
  '🧩': {from: '#9B59B6', to: '#3498DB'}, // Puzzle: Purple to Blue
  '🔑': {from: '#F1C40F', to: '#F39C12'}, // Key: Yellow to Orange
};

// Placeholder image as data URL (simple user icon)
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

// Function to render profile image consistently
const renderProfileImage = (photoURL: string | null | undefined, className: string = "h-6 w-6 rounded-full") => {
  return (
    <img
      src={PLACEHOLDER_IMAGE}
      alt="Profile"
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};

export default function ExpandableCardDemo({ cards, onAddWorkspace, currentUser }: ExpandableCardDemoProps) {
  const [active, setActive] = useState<WorkspaceCard | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<Record<string, WorkspaceDetailInfo>>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  
  // Function to get gradient colors based on emoji
  const getEmojiGradient = (emoji: string) => {
    // Default to white if emoji not found
    return EmojiGradients[emoji] || {from: '#FFFFFF', to: '#FFFFFF'};
  };

  const getWorkspaceDetails = async (workspaceId: string) => {
    const workspaceRef = doc(db, "workspaces", workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    const data = workspaceSnap.data();
    
    if (data) {
      // Get creator information
      let creatorInfo = {
        id: data.createdBy || "",
        displayName: "Unknown",
        photoURL: ""
      };
      
      if (data.createdBy) {
        const creatorRef = doc(db, "users", data.createdBy);
        const creatorSnap = await getDoc(creatorRef);
        if (creatorSnap.exists()) {
          const creatorData = creatorSnap.data();
          creatorInfo = {
            id: data.createdBy,
            displayName: creatorData.displayName || creatorData.email || "Unknown",
            photoURL: creatorData.photoURL || "" // Will use placeholder image
          };
        }
      }
      
      // Get collaborator information
      const collaboratorsInfo: CollaboratorInfo[] = [];
      if (data.collaborators && Array.isArray(data.collaborators)) {
        // Process up to 5 collaborators to avoid too many requests
        const collaboratorsToProcess = data.collaborators.slice(0, 5);
        
        // Use Promise.all to fetch all collaborator data in parallel
        const collaboratorPromises = collaboratorsToProcess.map(async (collaboratorId: string) => {
          // If this collaborator is the current user, use the current user data directly
          if (currentUser && collaboratorId === currentUser.uid) {
            return {
              id: currentUser.uid,
              displayName: currentUser.displayName || currentUser.email || "You",
              photoURL: currentUser.photoURL || "" // Will use placeholder image
            };
          }
          
          const collaboratorRef = doc(db, "users", collaboratorId);
          const collaboratorSnap = await getDoc(collaboratorRef);
          
          if (collaboratorSnap.exists()) {
            const collaboratorData = collaboratorSnap.data();
            
            return {
              id: collaboratorId,
              displayName: collaboratorData.displayName || collaboratorData.email || "Unknown",
              photoURL: collaboratorData.photoURL || "" // Will use placeholder image
            };
          }
          return null;
        });
        
        const resolvedCollaborators = await Promise.all(collaboratorPromises);
        resolvedCollaborators.forEach(collaborator => {
          if (collaborator) {
            collaboratorsInfo.push(collaborator);
          }
        });
      }
      
      setWorkspaceDetails(prevDetails => ({
        ...prevDetails,
        [workspaceId]: {
          emoji: data.emoji || '🏢',
          description: data.description || 'No description available',
          createdBy: creatorInfo,
          collaborators: collaboratorsInfo
        }
      }));
    }
  };

  useEffect(() => {
    cards.forEach(card => {
      if (!workspaceDetails[card.id]) {
        getWorkspaceDetails(card.id);
      }
    });
  }, [cards, workspaceDetails, currentUser]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActive(null);
      }
    };

    if (active) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [active, setActive]);

  // Add a debug log to check the user data
  useEffect(() => {
    if (currentUser) {
      console.log("Current user in ExpandableCardDemo:", {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        providerData: currentUser.providerData
      });
    }
  }, [currentUser]);

  const renderEmoji = (cardId: string) => (
    <div className="h-full w-full flex items-center justify-center text-4xl">
      {workspaceDetails[cardId]?.emoji || '🚀'}
    </div>
  );

  return (
    <div className="w-full">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={modalRef}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white sm:rounded-3xl overflow-hidden"
            >
              <motion.div 
                layoutId={`image-${active.id}-${id}`} 
                className="min-h-80 w-full flex items-center justify-center relative overflow-hidden rounded-b-[40px]"
              >
                <motion.div
                  className="absolute inset-0 w-[200%] h-full opacity-50"
                  style={{
                    background: `linear-gradient(90deg, 
                      ${getEmojiGradient(workspaceDetails[active.id]?.emoji || '🚀').from} 0%, 
                      ${getEmojiGradient(workspaceDetails[active.id]?.emoji || '🚀').to} 50%, 
                      ${getEmojiGradient(workspaceDetails[active.id]?.emoji || '🚀').from} 100%)`
                  }}
                  animate={{
                    x: [0, "-50%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 8,
                    ease: "linear"
                  }}
                />
                <div className="relative z-10">
                  {renderEmoji(active.id)}
                </div>
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-bold text-neutral-700"
                    >
                      {active.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.id}-${id}`}
                      className="text-neutral-600"
                    >
                      {workspaceDetails[active.id]?.description || 'Loading...'}
                    </motion.p>
                  </div>

                  <motion.div layoutId={`button-${active.id}-${id}`}>
                    <a href={`/dashboard/${active.id}`} className="p-[1px] relative block">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                      <div className="px-4 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white">
                        <div className="flex items-center whitespace-nowrap">
                          <span>Open</span>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    <div className="flex flex-col gap-4 w-full">
                      {/* Workspace type */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium"></span> 
                        {active.type === 'Owned' ? '' : ''}
                      </div>
                      
                      {/* Collaborators section with profile pictures */}
                      {workspaceDetails[active.id]?.collaborators.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-2">
                            {workspaceDetails[active.id]?.collaborators.map((collaborator) => (
                              <div key={collaborator.id} className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <div className="mr-2">
                                  {renderProfileImage(collaborator.photoURL, "w-6 h-6 rounded-full")}
                                </div>
                                <span className="text-xs">{collaborator.displayName}</span>
                              </div>
                            ))}
                            {workspaceDetails[active.id]?.collaborators.length > 5 && (
                              <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <span className="text-xs">+{workspaceDetails[active.id].collaborators.length - 5} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="w-full flex flex-col items-center gap-4">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className="w-full p-4 flex flex-col md:flex-row justify-between items-center hover:bg-gray-100 rounded-xl cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-center">
              <motion.div 
                layoutId={`image-${card.id}-${id}`} 
                className="h-20 w-20 md:h-14 md:w-14 rounded-lg overflow-hidden flex items-center justify-center"
              >
                {renderEmoji(card.id)}
              </motion.div>
              <div className="text-center md:text-left ml-4">
                <motion.h3
                  layoutId={`title-${card.id}-${id}`}
                  className="font-bold text-neutral-800 "
                >
                  {card.name}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.id}-${id}`}
                  className="text-neutral-600"
                >
                  {workspaceDetails[card.id]?.description.substring(0, 100) || 'Loading...'}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">

              
              {/* Show collaborator avatars in the card */}
              {workspaceDetails[card.id]?.collaborators.length > 0 && (
                <div className="flex -space-x-3 overflow-hidden" title={`${workspaceDetails[card.id]?.collaborators.length} collaborators`}>
                  {workspaceDetails[card.id]?.collaborators.slice(0, 3).map((collaborator, index) => (
                    <div 
                      key={collaborator.id} 
                      className="relative inline-block"
                      style={{ zIndex: 3 - index }}
                    >
                      {renderProfileImage(collaborator.photoURL, "w-6 h-6 rounded-full")}
                    </div>
                  ))}
                  {workspaceDetails[card.id]?.collaborators.length > 3 && (
                    <div className="inline-block relative" style={{ zIndex: 0 }}>
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs">
                        +{workspaceDetails[card.id]?.collaborators.length - 3}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <motion.div layoutId={`button-${card.id}-${id}`}>
                <a href={`/dashboard/${card.id}`} className="p-[1px] relative block">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                  <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white">
                    <div className="flex items-center whitespace-nowrap">
                      <span>Open</span>
                    </div>
                  </div>
                </a>
              </motion.div>
            </div>
          </motion.div>
        ))}
        <motion.div
          onClick={onAddWorkspace}
          className="w-full p-4 flex justify-center items-center hover:bg-gray-100 rounded-xl cursor-pointer transition-colors duration-200"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          <span>Add Workspace</span>
        </motion.div>
      </ul>
    </div>
  );
}

const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};