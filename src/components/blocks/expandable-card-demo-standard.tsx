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

interface ExpandableCardDemoProps {
  cards: WorkspaceCard[];
  onAddWorkspace: () => void;
}

export default function ExpandableCardDemo({ cards, onAddWorkspace }: ExpandableCardDemoProps) {
  const [active, setActive] = useState<WorkspaceCard | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<Record<string, { emoji: string; description: string }>>({});
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const getWorkspaceDetails = async (workspaceId: string) => {
    const workspaceRef = doc(db, "workspaces", workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    const data = workspaceSnap.data();
    if (data) {
      setWorkspaceDetails(prevDetails => ({
        ...prevDetails,
        [workspaceId]: {
          emoji: data.emoji || '🏢',
          description: data.description || 'No description available'
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
  }, [cards, workspaceDetails]);

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

  useOutsideClick(ref, () => setActive(null));

  const renderEmoji = (workspaceId: string) => {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white text-4xl">
        {workspaceDetails[workspaceId]?.emoji || '🏢'}
      </div>
    );
  };

  return (
    <>
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
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.id}-${id}`} className="h-80 w-full">
                {renderEmoji(active.id)}
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.id}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {workspaceDetails[active.id]?.description || 'Loading...'}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.id}-${id}`}
                    href={`/workspace/${active.id}`}
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    Open
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    <p>
                      Workspace ID: {active.id}<br />
                      Type: {active.type} Workspace<br />
                      Emoji: {workspaceDetails[active.id]?.emoji || 'Loading...'}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full gap-4">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors duration-200"
          >
            <div className="flex gap-4 flex-col md:flex-row items-center md:items-start">
              <motion.div layoutId={`image-${card.id}-${id}`} className="h-40 w-40 md:h-14 md:w-14 rounded-lg overflow-hidden">
                {renderEmoji(card.id)}
              </motion.div>
              <div>
                <motion.h3
                  layoutId={`title-${card.id}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                  {card.name}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.id}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                >
                  {workspaceDetails[card.id]?.description || 'Loading...'}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {card.type === 'Owned' ? (
                <UserIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <UsersIcon className="w-5 h-5 text-gray-500" />
              )}
              <motion.button
                layoutId={`button-${card.id}-${id}`}
                className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0 transition-colors duration-200"
              >
                Open
              </motion.button>
            </div>
          </motion.div>
        ))}
        <motion.div
          onClick={onAddWorkspace}
          className="p-4 flex justify-center items-center hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors duration-200"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          <span>Add Workspace</span>
        </motion.div>
      </ul>
    </>
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