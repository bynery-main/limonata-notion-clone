"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/firebaseConfig"; // Adjust this import based on your actual Firebase config file

interface FlashcardComponentProps {
  onClose: () => void;
  workspaceId: string;
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ onClose, workspaceId }) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<{ folderId: string; noteId: string }[]>([]);

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
    const functions = getFunctions(app);
    const createFlashcards = httpsCallable(functions, "flashcardAgent");

    try {
      // Specify according to the cloud function
      const result = await createFlashcards({
        workspaceId,
        notes: selectedNotes,
      });
      console.log("Flashcards created successfully:", result.data);
    } catch (error) {
      console.error("Error creating flashcards:", error);
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
          >
            Create Flashcards
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardComponent;
