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
  onFlashcardsUpdate: (decks: FlashcardDeck[]) => void;
  onFlashcardDeckSelect: (deck: FlashcardDeck) => void;
}

const FlashcardsDropdown: React.FC<FlashcardsDropdownProps> = ({
  workspaceId,
  currentFlashcardDeckId,
  onFlashcardsUpdate,
  onFlashcardDeckSelect,
}) => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [openDeckId, setOpenDeckId] = useState<string | null>(null);

  useEffect(() => {
    const decksRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");

    const unsubscribe = onSnapshot(decksRef, (snapshot) => {
      const updatedDecks: FlashcardDeck[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Deck",
      }));

      console.log("Received decks from Firestore:", updatedDecks);
      setDecks(updatedDecks);
      onFlashcardsUpdate(updatedDecks);
    });

    return () => unsubscribe();
  }, [workspaceId, onFlashcardsUpdate]);

  return (
    <div>
      <Accordion.Root 
        type="single" 
        value={openDeckId || undefined} 
        onValueChange={(value) => setOpenDeckId(value)}
        className="space-y-2"
      >
        {decks.map((deck) => (
          <Accordion.Item
            key={deck.id}
            value={deck.id}
            className={`border rounded-lg shadow-lg ${deck.id === currentFlashcardDeckId ? 'bg-gray-100' : ''}`}
          >
            <Accordion.Trigger
              className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
              onClick={() => {
                console.log("Selected deck:", deck);
                onFlashcardDeckSelect(deck);
              }}
            >
              <span>{deck.name}</span>
              {deck.id === openDeckId ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Accordion.Trigger>
            <Accordion.Content>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
};

export default FlashcardsDropdown;
