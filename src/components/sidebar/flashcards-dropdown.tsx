"use client";

import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot, getDocs, query, CollectionReference } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { BookOpenIcon, ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";

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
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
const menuIconRef = useRef<HTMLDivElement>(null);
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

  const handleDropdownToggle = (event: React.MouseEvent, deck: FlashcardDeck) => {
    event.stopPropagation();
    console.log("Dropdown toggle clicked for deck:", deck);
    setSelectedDeck(deck);

    const targetRect = (event.target as HTMLElement).getBoundingClientRect();
    setDropdownPosition({ top: targetRect.bottom, left: targetRect.left });
    setDropdownVisible(!dropdownVisible);
  };

  const handleRenameDeck = async () => {
    const newName = prompt("Enter a new name for this flashcard deck:", selectedDeck?.name);
    if (newName && selectedDeck) {
      console.log("Renaming deck:", selectedDeck.id, "to new name:", newName);
      const deckRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", selectedDeck.id);
      await updateDoc(deckRef, { name: newName });
    }
    setDropdownVisible(false);
  };

  const deleteCollection = async (collectionRef: CollectionReference) => {
    const querySnapshot = await getDocs(query(collectionRef));
    const deleteOps = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });
    await Promise.all(deleteOps);
  };

  const handleDeleteDeck = async () => {
    if (selectedDeck) {
      const confirmDelete = confirm(`Are you sure you want to delete ${selectedDeck.name}?`);
      if (confirmDelete) {
        try {
          console.log("Deleting deck:", selectedDeck.id);
          const deckRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", selectedDeck.id);
          
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
    }
    setDropdownVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  return (
    <div>
      <Accordion.Root
        type="single"
        value={openAccordion ? "flashcards" : undefined}
        onValueChange={(value) => setOpenAccordion(value === "flashcards")}
        className="space-y-2"
      >
        <Accordion.Item
          value="flashcards"
          className={`border rounded-lg ${dropdownVisible ? 'shadow-xl border-2' : ''}`}
        >
          <Accordion.Trigger
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
            onClick={() => {
              console.log("Accordion trigger clicked, toggling accordion state.");
              setOpenAccordion(!openAccordion);
            }}
          >
            <div className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-2" />
              <span>Flashcards</span>
            </div>
            {openAccordion ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Accordion.Trigger>
          <Accordion.Content
            className={`pl-4 ${openAccordion ? 'block' : 'hidden'}`}
          >
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`p-2 text-sm w-full text-left flex items-center justify-between cursor-pointer ${deck.id === currentFlashcardDeckId ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  console.log("Selected deck:", deck);
                  onFlashcardDeckSelect(deck);
                }}
              >
                <span>{deck.name}</span>
                <div className="flex-shrink-0 relative" ref={menuIconRef}>
                  <MoreHorizontalIcon
                    className="h-4 w-4 cursor-pointer"
                    onClick={(event) => handleDropdownToggle(event, deck)}
                  />
                {dropdownVisible && selectedDeck?.id === deck.id && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-0 right-full mr-2 w-48 bg-white border rounded-lg shadow-lg z-10"
                  >
                    <button
                      onClick={handleRenameDeck}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <div className="flex items-center">
                        <PencilIcon className="h-3.5 w-3.5 mr-2"/> Rename 
                      </div>
                    </button>
                    <button
                      onClick={handleDeleteDeck}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <div className="flex items-center">
                        <TrashIcon className="h-3.5 w-3.5 mr-2"/>
                        Delete
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            ))}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default FlashcardsDropdown;
