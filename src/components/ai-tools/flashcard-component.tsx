"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import Flashcards from "./flashcards";
import { StarsIcon } from "lucide-react";
import { Checkbox } from "@chakra-ui/checkbox";
import { useToast } from "@chakra-ui/react";
import NoCreditsModal from "../subscribe/no-credits-modal";

interface FlashcardComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string;
}

const allowedFileExtensions = ["pdf", "docx", "ppt", "pptx", "mp3", "wav"]; // Allowed extensions

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
  const [selectedNotes, setSelectedNotes] = useState<NoteReference[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false); // State for showing credit modal
  const [creditCost] = useState(20); // Assuming credit cost is 20
  const [remainingCredits, setRemainingCredits] = useState(0); // State to hold remaining credits
  const toast = useToast();
  const isDisabled = loading || selectedNotes.length === 0;

  useEffect(() => {
    const fetchNotesAndFiles = async () => {
      try {
        const fetchedNotes = await fetchAllNotes(workspaceId);
        const fetchedFiles = await fetchAllFiles(workspaceId);
        const combinedFoldersNotes = mergeNotesAndFiles(fetchedNotes, fetchedFiles);
        setFoldersNotes(combinedFoldersNotes);
      } catch (error) {
        console.error("Error fetching notes and files:", error);
      }
    };

    fetchNotesAndFiles();
  }, [workspaceId]);

  // Merges notes and files, filtering files by allowed extensions
  const mergeNotesAndFiles = (notes: FolderNotes[], files: FolderNotes[]): FolderNotes[] => {
    const mergedFolders: FolderNotes[] = notes.map(noteFolder => {
      const matchingFileFolder = files.find(fileFolder => fileFolder.folderId === noteFolder.folderId);

      // Filter files by allowed extensions
      const filteredFiles = matchingFileFolder
        ? matchingFileFolder.notes.filter(file => {
            const extension = file.name.split('.').pop()?.toLowerCase();
            return allowedFileExtensions.includes(extension || '');
          })
        : [];

      return {
        folderId: noteFolder.folderId,
        folderName: noteFolder.folderName,
        notes: [...noteFolder.notes, ...filteredFiles], // Merge notes and filtered files
      };
    });

    return mergedFolders;
  };

  const handleCheckboxChange = (
    folderId: string,
    noteId: string,
    isChecked: boolean,
    type: 'note' | 'file'
  ) => {
    if (isChecked) {
      setSelectedNotes([...selectedNotes, { folderId, noteId, type }]);
    } else {
      setSelectedNotes(
        selectedNotes.filter(
          (note) => note.noteId !== noteId || note.folderId !== folderId || note.type !== type
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
        cost: creditCost,
      })) as { data: CreditUsageResult };

      console.log("Credit usage result:", creditUsageResult.data);

      if (!creditUsageResult.data.success) {
        setRemainingCredits(creditUsageResult.data.remainingCredits);
        setShowCreditModal(true);
        setLoading(false);
        return;
      }

      // Separate notes and files from selectedNotes
      const notes = selectedNotes.filter(note => note.type === 'note').map(note => ({ folderId: note.folderId, noteId: note.noteId }));
      const files = selectedNotes.filter(note => note.type === 'file').map(note => ({ folderId: note.folderId, fileId: note.noteId }));

      // If credit usage was successful, proceed with flashcard creation
      const result = await createFlashcards({
        workspaceId,
        notes,
        files, // Add files to the payload
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
    <>
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
          <p className="text-center">Click on the notes and transcripts would you like to use</p>
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
                            e.target.checked,
                            note.type
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
              className={`relative inline-flex h-12 overflow-hidden rounded-full p-[2.5px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleCreateFlashcards}
              disabled={isDisabled}
            >
              <span className={`absolute inset-[-1000%] ${
                isDisabled ? '' : 'animate-[spin_2s_linear_infinite]'
              } bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]`} />
              <span className={`inline-flex h-full w-full items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl ${
                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}>
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

      {/* Use NoCreditsModal for insufficient credits */}
      {showCreditModal && (
        <NoCreditsModal
          remainingCredits={remainingCredits}
          creditCost={creditCost}
          onClose={() => setShowCreditModal(false)}
        />
      )}
    </>
  );
};

export default FlashcardComponent;
