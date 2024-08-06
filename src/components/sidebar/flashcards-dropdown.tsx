"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { CirclePlusIcon } from "lucide-react";

interface FlashcardDeck {
  id: string;
  name: string;
}

interface FlashcardsDropdownProps {
  workspaceId: string;
  onFlashcardsUpdate: (flashcardDecks: FlashcardDeck[]) => void;
  onFlashcardDeckSelect: (flashcardDeck: FlashcardDeck) => void;
  currentFlashcardDeckId: string | null;
}

const FlashcardsDropdown: React.FC<FlashcardsDropdownProps> = ({
  workspaceId,
  onFlashcardsUpdate,
  onFlashcardDeckSelect,
  currentFlashcardDeckId,
}) => {
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [openDeckId, setOpenDeckId] = useState<string | null>(null);

  useEffect(() => {
    const decksRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");

    const unsubscribe = onSnapshot(decksRef, (snapshot) => {
      const updatedDecks: FlashcardDeck[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Deck",
      }));

      setFlashcardDecks(updatedDecks);
      onFlashcardsUpdate(updatedDecks);
    });

    return () => unsubscribe();
  }, [workspaceId, onFlashcardsUpdate]);

  const handleAddDeck = async () => {
    if (newDeckName.trim() === "") return;

    const decksRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");

    await setDoc(doc(decksRef), {
      name: newDeckName,
    });

    setNewDeckName("");
  };

  return (
    <div>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-4 px-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#24222066]">
            Flashcards
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            placeholder="New Deck Name"
            className="border p-2 rounded flex-grow"
          />
          <button
            onClick={handleAddDeck}
            className="bg-white text-black p-2 rounded hover:bg-blue-500 hover:text-white"
          >
            <CirclePlusIcon className="h-4 w-4" />
          </button>
        </div>
        <Accordion.Root
          type="single"
          value={openDeckId || undefined}
          onValueChange={(value) => setOpenDeckId(value)}
          className="space-y-2"
        >
          {flashcardDecks.map((deck) => (
            <Accordion.Item
              key={deck.id}
              value={deck.id}
              className="border rounded-lg relative group shadow-lg"
            >
              <Accordion.Trigger
                className="hover:no-underline p-2 dark:text-muted-foreground text-sm w-full text-left"
                onClick={() => onFlashcardDeckSelect(deck)}
              >
                <div className="flex gap-4 items-center justify-between overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="overflow-hidden text-ellipsis">
                      {deck.name}
                    </span>
                  </div>
                </div>
              </Accordion.Trigger>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default FlashcardsDropdown;
