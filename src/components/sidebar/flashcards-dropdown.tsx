"use client";

import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const decksRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");

    const unsubscribe = onSnapshot(decksRef, (snapshot) => {
      const updatedDecks: FlashcardDeck[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Deck",
      }));

      setDecks(updatedDecks);
    });

    return () => unsubscribe();
  }, [workspaceId]);

  const handleDropdownToggle = (event: React.MouseEvent, deck: FlashcardDeck) => {
    event.stopPropagation(); // Prevent the click from bubbling up
    setSelectedDeck(deck);
    setDropdownVisible(!dropdownVisible);
  };

  const handleRenameDeck = async () => {
    const newName = prompt("Enter a new name for this flashcard deck:", selectedDeck?.name);
    if (newName && selectedDeck) {
      const deckRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", selectedDeck.id);
      await updateDoc(deckRef, { name: newName });
    }
    setDropdownVisible(false);
  };

  const handleDeleteDeck = async () => {
    if (selectedDeck) {
      const confirmDelete = confirm(`Are you sure you want to delete ${selectedDeck.name}?`);
      if (confirmDelete) {
        const deckRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", selectedDeck.id);
        await deleteDoc(deckRef);
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
            onClick={() => setOpenAccordion(!openAccordion)}
          >
            <span>Flashcards</span>
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
                onClick={() => onFlashcardDeckSelect(deck)}
              >
                <span>{deck.name}</span>
                <MoreHorizontalIcon
                  className="h-4 w-4 cursor-pointer"
                  onClick={(event) => handleDropdownToggle(event, deck)}
                />
                {dropdownVisible && selectedDeck?.id === deck.id && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
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
            ))}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default FlashcardsDropdown;
