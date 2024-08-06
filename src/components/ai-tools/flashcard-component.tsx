"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig"; // Adjust this import based on your actual Firebase config file
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import Flashcards from "./flashcards"; // Ensure to create and import the Flashcards component

interface FlashcardComponentProps {
  onClose: () => void;
  workspaceId: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

const parseRawDataToFlashcards = (rawData: string): Flashcard[] => {
  console.log("Data received by parser:", rawData); // Log the raw data received by the parser
  const flashcards: Flashcard[] = [];
  const flashcardRegex = /Flashcard \d+: Question: ([\s\S]+?) Answer: ([\s\S]+?)(?=\nFlashcard \d+:|$)/g;
  let match;
  while ((match = flashcardRegex.exec(rawData)) !== null) {
    flashcards.push({ question: match[1].trim(), answer: match[2].trim() });
  }

  console.log("Flashcards parsed:", flashcards); // Log the flashcards parsed from the raw data
  return flashcards;
};

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ onClose, workspaceId }) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<{ folderId: string; noteId: string }[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const fetchedNotes = await fetchAllNotes(workspaceId);
      setFoldersNotes(fetchedNotes);
    };

    fetchNotes();
  }, [workspaceId]);

  const handleCheckboxChange = (folderId: string, noteId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedNotes([...selectedNotes, { folderId, noteId }]);
    } else {
      setSelectedNotes(selectedNotes.filter((note) => note.noteId !== noteId || note.folderId !== folderId));
    }
  };

  const handleCreateFlashcards = async () => {
    const functions = getFunctions(app); // Ensure the correct usage of getFunctions
    const createFlashcards = httpsCallable(functions, "flashcardAgent");

    setLoading(true);
    try {
      const result = await createFlashcards({
        workspaceId,
        notes: selectedNotes,
      });
      console.log("Flashcards created successfully:", result.data);

      const data = result.data as { flashcards: { raw: string } }; // Type assertion
      const raw = data.flashcards.raw || "";

      // Log the raw data before parsing
      console.log("Raw data received from cloud function:", raw);

      // Parse raw data into flashcards
      const parsedFlashcards = parseRawDataToFlashcards(raw);
      setFlashcards(parsedFlashcards);

      // Create a new deck named "New Deck" and save it to Firestore
      const deckRef = doc(collection(db, "workspaces", workspaceId, "flashcardsDecks"));
      await setDoc(deckRef, { name: "New Deck" });

      // Save each flashcard to Firestore under the new deck
      const flashcardsCollectionRef = collection(deckRef, "flashcards");
      for (const flashcard of parsedFlashcards) {
        await addDoc(flashcardsCollectionRef, { question: flashcard.question, answer: flashcard.answer });
      }
    } catch (error) {
      console.error("Error creating flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Flashcards</h2>
          <button onClick={onClose} className="text-xl font-bold">
            &times;
          </button>
        </div>
        <p className="text-center">Which notes would you like to use?</p>
        <ul className="mt-4">
          {foldersNotes.map((folder) => (
            <li key={folder.folderId}>
              <h3 className="font-bold">{folder.folderName}</h3>
              <ul className="pl-4">
                {folder.notes.map((note) => (
                  <li key={note.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => handleCheckboxChange(folder.folderId, note.id, e.target.checked)}
                    />
                    {note.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCreateFlashcards}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Flashcards"}
          </button>
        </div>
        {flashcards.length > 0 && <Flashcards flashcards={flashcards} />}
      </div>
    </div>
  );
};

export default FlashcardComponent;
