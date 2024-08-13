"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import Flashcards from "./flashcards"; // Ensure to create and import the Flashcards component
import { StarsIcon } from "lucide-react";
import { Checkbox } from "@chakra-ui/checkbox";
import { useToast } from "@chakra-ui/react";

interface FlashcardComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string; // Add userId prop
}

interface Flashcard {
  question: string;
  answer: string;
}

interface NameGenerationResult {
  success: boolean;
  answer: string;
}

interface CreditUsageResult {
  success: boolean;
  message: string;
  remainingCredits: number;
}

const parseRawDataToFlashcards = (rawData: string): Flashcard[] => {
  console.log("Data received by parser:", rawData);
  const flashcards: Flashcard[] = [];
  const flashcardRegex =
    /Flashcard \d+: Question: ([\s\S]+?) Answer: ([\s\S]+?)(?=\nFlashcard \d+:|$)/g;
  let match;
  while ((match = flashcardRegex.exec(rawData)) !== null) {
    flashcards.push({ question: match[1].trim(), answer: match[2].trim() });
  }

  console.log("Flashcards parsed:", flashcards);
  return flashcards;
};

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  onClose,
  workspaceId,
  userId,
}) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<
    { folderId: string; noteId: string }[]
  >([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      const fetchedNotes = await fetchAllNotes(workspaceId);
      setFoldersNotes(fetchedNotes);
    };

    fetchNotes();
  }, [workspaceId]);

  const handleCheckboxChange = (
    folderId: string,
    noteId: string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedNotes([...selectedNotes, { folderId, noteId }]);
    } else {
      setSelectedNotes(
        selectedNotes.filter(
          (note) => note.noteId !== noteId || note.folderId !== folderId
        )
      );
    }
  };

  const handleCreateFlashcards = async () => {
    const functions = getFunctions(app);
    const createFlashcards = httpsCallable(functions, "flashcardAgent");
    const generateName = httpsCallable(functions, "nameResource");
    const creditValidation = httpsCallable(functions, "useCredits");

    setLoading(true);
    try {
      // First, attempt to use credits
      const creditUsageResult = (await creditValidation({
        uid: userId,
        cost: 20,
      })) as { data: CreditUsageResult };

      console.log("Credit usage result:", creditUsageResult.data);

      if (!creditUsageResult.data.success) {
        toast({
          title: "Error",
          description: creditUsageResult.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // If credit usage was successful, proceed with flashcard creation
      const result = await createFlashcards({
        workspaceId,
        notes: selectedNotes,
      });

      const data = result.data as { flashcards: { raw: string } };
      const raw = data.flashcards.raw || "";

      const parsedFlashcards = parseRawDataToFlashcards(raw);
      setFlashcards(parsedFlashcards);

      const nameGenerationResult = await generateName({ content: raw });
      const generatedName = (nameGenerationResult.data as NameGenerationResult)
        .answer;

      const deckRef = doc(
        collection(db, "workspaces", workspaceId, "flashcardsDecks")
      );
      await setDoc(deckRef, { name: generatedName });

      const flashcardsCollectionRef = collection(deckRef, "flashcards");
      for (const flashcard of parsedFlashcards) {
        await addDoc(flashcardsCollectionRef, {
          question: flashcard.question,
          answer: flashcard.answer,
        });
      }

      toast({
        title: "Success",
        description: "Flashcards created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating flashcards:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating flashcards",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-center font-semibold">
            Create Flashcards
          </h2>
          <button onClick={onClose} className="text-xl font-bold">
            &times;
          </button>
        </div>
        <p className="text-center">Which notes would you like to use?</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {foldersNotes.map((folder) => (
            <div
              key={folder.folderId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h3 className="font-bold mb-2">{folder.folderName}</h3>
              <ul className="space-y-2">
                {folder.notes.map((note) => (
                  <li key={note.id}>
                    <Checkbox
                      onChange={(e) =>
                        handleCheckboxChange(
                          folder.folderId,
                          note.id,
                          e.target.checked
                        )
                      }
                      borderRadius="md"
                      colorScheme="blue"
                    >
                      {note.name}
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            className="relative inline-flex h-12 overflow-hidden rounded-full p-[2.5px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            onClick={handleCreateFlashcards}
            disabled={loading}
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <div className="mr-1.5">
                    <StarsIcon style={{ width: "15px", height: "15px" }} />
                  </div>
                  Create Flashcards
                </>
              )}
            </span>
          </button>
        </div>
        {flashcards.length > 0 && <Flashcards flashcards={flashcards} />}
      </div>
    </div>
  );
};

export default FlashcardComponent;
