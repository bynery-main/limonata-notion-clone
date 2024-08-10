"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

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
          className="border rounded-lg shadow-lg"
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
              </div>
            ))}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default FlashcardsDropdown;
