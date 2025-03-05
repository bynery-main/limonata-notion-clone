"use client";

import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot, getDocs, query, CollectionReference } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { BookOpenIcon, ChevronRightIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface FlashcardDeck {
  id: string;
  name: string;
}

interface FlashcardsDropdownProps {
  workspaceId: string;
  currentFlashcardDeckId: string | null;
  onFlashcardDeckSelect: (deck: FlashcardDeck) => void;
}

const FlashcardsDropdown: React.FC<FlashcardsDropdownProps> = ({
  workspaceId,
  currentFlashcardDeckId,
  onFlashcardDeckSelect,
}) => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<{[key: string]: boolean}>({});
  const [menuPosition, setMenuPosition] = useState<{[key: string]: {top: number, left: number}}>({});
  const [renamingDeckId, setRenamingDeckId] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    console.log("Subscribing to flashcards decks updates for workspace:", workspaceId);
    const decksRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");

    const unsubscribe = onSnapshot(decksRef, (snapshot) => {
      const updatedDecks: FlashcardDeck[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Deck",
      }));

      console.log("Received decks from Firestore:", updatedDecks);
      setDecks(updatedDecks);
    });

    return () => {
      console.log("Unsubscribing from flashcards decks updates for workspace:", workspaceId);
      unsubscribe();
    };
  }, [workspaceId]);

  const toggleMenu = (event: React.MouseEvent, deckId: string) => {
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition(prev => ({
      ...prev,
      [deckId]: {
        top: rect.top,
        left: rect.left
      }
    }));
    
    setShowMenu(prev => {
      const newState = { ...prev };
      // Close all other menus
      Object.keys(newState).forEach(key => {
        newState[key] = false;
      });
      // Toggle this menu
      newState[deckId] = !prev[deckId];
      return newState;
    });
  };

  const startRenameDeck = (deck: FlashcardDeck, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setRenamingDeckId(deck.id);
    setNewDeckName(deck.name);
    // Close the menu if it's open
    setShowMenu(prev => ({
      ...prev,
      [deck.id]: false
    }));
    
    setTimeout(() => {
      if (renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
      }
    }, 50);
  };

  const handleRenameDeck = async (deckId: string) => {
    if (newDeckName.trim() === "") return;
    
    const deck = decks.find(d => d.id === deckId);
    if (deck && newDeckName === deck.name) {
      setRenamingDeckId(null);
      return;
    }

    try {
      console.log("Renaming deck:", deckId, "to new name:", newDeckName);
      const deckRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", deckId);
      await updateDoc(deckRef, { name: newDeckName });
    } catch (error) {
      console.error("Error renaming deck:", error);
    }
    
    setRenamingDeckId(null);
  };

  const deleteCollection = async (collectionRef: CollectionReference) => {
    const querySnapshot = await getDocs(query(collectionRef));
    const deleteOps = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });
    await Promise.all(deleteOps);
  };

  const handleDeleteDeck = async (deck: FlashcardDeck, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const confirmDelete = confirm(`Are you sure you want to delete ${deck.name}?`);
    if (confirmDelete) {
      try {
        console.log("Deleting deck:", deck.id);
        const deckRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", deck.id);
        
        // Delete the flashcards subcollection
        const flashcardsCollectionRef = collection(deckRef, "flashcards");
        await deleteCollection(flashcardsCollectionRef);
        
        // Delete the main deck document
        await deleteDoc(deckRef);
        
        console.log("Flashcard deck and all nested flashcards deleted successfully");
      } catch (error) {
        console.error("Error deleting flashcard deck:", error);
      }
    }
    
    // Close the menu
    setShowMenu(prev => ({
      ...prev,
      [deck.id]: false
    }));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (renamingDeckId) {
      const target = event.target as Node;
      if (renameInputRef.current && !renameInputRef.current.contains(target)) {
        handleRenameDeck(renamingDeckId);
      }
    }
    
    // Close any open menus when clicking outside
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu({});
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [renamingDeckId]);

  const renderMenu = (deck: FlashcardDeck) => {
    if (!isBrowser || !showMenu[deck.id]) return null;
    
    const position = menuPosition[deck.id] || { top: 0, left: 0 };
    
    return createPortal(
      <div
        ref={menuRef}
        className="fixed w-48 bg-white border rounded-lg shadow-lg z-50"
        style={{
          top: position.top,
          right: window.innerWidth - position.left + 10,
        }}
      >
        <button
          onClick={(event) => {
            event.stopPropagation();
            startRenameDeck(deck, event);
          }}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <div className="flex items-center">
            <PencilIcon className="h-3.5 w-3.5 mr-2"/> Rename 
          </div>
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleDeleteDeck(deck, event);
          }}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <div className="flex items-center">
            <TrashIcon className="h-3.5 w-3.5 mr-2"/>
            Delete
          </div>
        </button>
      </div>,
      document.body
    );
  };

  return (
    <div>
      <div className="space-y-2">
        <div className="border rounded-lg">
          <div
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between cursor-pointer"
            onClick={() => {
              console.log("Accordion trigger clicked, toggling accordion state.");
              setOpenAccordion(!openAccordion);
            }}
          >
            <div className="flex items-center">
              <BookOpenIcon className="h-4 w-4 mr-2" />
              <span>Flashcards</span>
            </div>
            <ChevronRightIcon 
              className="h-4 w-4 transition-transform duration-300" 
              style={{ transform: openAccordion ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </div>
          
          <AnimatePresence initial={false} mode="wait">
            {openAccordion && (
              <motion.div 
                className="pl-4 overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.3,
                  exit: { duration: 0.3 }
                }}
              >
                {decks.length === 0 ? (
                  <motion.div 
                    className="p-2 text-sm font-light text-gray-500"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    Create your first Flashcard Deck by pressing the
                    <img
                      src="/favicon.ico"
                      alt="LemonGPT"
                      className="inline-block mx-1 w-4 h-4"
                    />                                
                    on the <b className="font-bold">bottom right</b>!
                  </motion.div>
                ) : (
                  decks.map((deck, index) => (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: index * 0.05,
                        exit: { duration: 0.2, delay: 0 }
                      }}
                      className={`p-2 text-sm w-full text-left flex items-center hover:bg-gray-100 rounded-lg justify-between cursor-pointer ${deck.id === currentFlashcardDeckId ? 'bg-gray-100' : ''}`}
                      onClick={() => {
                        if (renamingDeckId !== deck.id) {
                          console.log("Selected deck:", deck);
                          onFlashcardDeckSelect(deck);
                        }
                      }}
                      onDoubleClick={(e) => {
                        if (renamingDeckId !== deck.id) {
                          startRenameDeck(deck, e);
                        }
                      }}
                    >
                      {renamingDeckId === deck.id ? (
                        <div className="flex items-center flex-grow" onClick={(e) => e.stopPropagation()}>
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                            onBlur={() => handleRenameDeck(deck.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameDeck(deck.id);
                              if (e.key === "Escape") setRenamingDeckId(null);
                            }}
                            className="text-sm bg-transparent w-full border border-gray-300 rounded p-1 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <span>{deck.name}</span>
                      )}
                      
                      {renamingDeckId !== deck.id && (
                        <div className="flex-shrink-0">
                          <MoreHorizontalIcon
                            className="h-4 w-4 cursor-pointer"
                            onClick={(event) => toggleMenu(event, deck.id)}
                          />
                          {renderMenu(deck)}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsDropdown;
