"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import Flashcards from "./flashcards";
import { Checkbox } from "@chakra-ui/checkbox";
import { Button } from "@chakra-ui/react";
import ReactToast from "react-hot-toast";
import NoCreditsModal from "../subscribe/no-credits-modal";
import FancyText from '@carefully-coded/react-text-gradient';
import CostButton from "./cost-button";
import router from "next/router";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

interface FlashcardComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string;
  onBack: () => void;
}

const allowedFileExtensions = ["pdf", "docx", "ppt", "pptx", "mp3", "wav"]; // Allowed extensions

const parseRawDataToFlashcards = (rawData: string): Flashcard[] => {
  console.log("Data received by parser:", rawData);
  const flashcards: Flashcard[] = [];
  const flashcardRegex = /Flashcard \d+:\s*Question:\s*([\s\S]+?)\s*Answer:\s*([\s\S]+?)(?=(?:\n|^)Flashcard \d+:|$)/gi;
  
  let match;
  while ((match = flashcardRegex.exec(rawData)) !== null) {
    if (match[1] && match[2]) {
      flashcards.push({
        question: match[1].trim(),
        answer: match[2].trim()
      });
    }
  }

  console.log("Flashcards parsed:", flashcards);
  return flashcards;
};

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  onClose,
  workspaceId,
  userId,
  onBack,
}) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<NoteReference[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false); // State for showing credit modal
  const [creditCost] = useState(20); // Assuming credit cost is 20
  const [remainingCredits, setRemainingCredits] = useState(0); // State to hold remaining credits
  const isDisabled = loading || selectedNotes.length === 0;
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  var generatedName = ""; // Initialize generatedName
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
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    handleCreateFlashcards();
  };



  const handleCreateFlashcards = async () => {
    const functions = getFunctions(app);
    const createFlashcards = httpsCallable(functions, "flashcardAgent", { timeout: 240000 });
    const generateName = httpsCallable(functions, "nameResource");
    const creditValidation = httpsCallable(functions, "useCredits");
    setLoading(true);
    try {
      const creditUsageResult = await creditValidation({
        uid: userId,
        cost: creditCost,
      }) as { data: CreditUsageResult };

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

      // Attempt flashcard creation
      const result = await createFlashcards({
        workspaceId,
        notes,
        files,
      });

      if (!result || !result.data) {
        throw new Error("No data returned from flashcard creation");
      }

      const data = result.data as { answer: string };
      const raw = data.answer || "";

      const parsedFlashcards = parseRawDataToFlashcards(raw);

      if (parsedFlashcards.length === 0) {
        throw new Error("No flashcards could be created from the provided content");
      }

      setFlashcards(parsedFlashcards);

      const nameGenerationResult = await generateName({ content: raw });
      if (!nameGenerationResult.data) {
        throw new Error("Failed to generate name for flashcard deck");
      }
      generatedName = (nameGenerationResult.data as NameGenerationResult).answer;

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

      // Success toast
      ReactToast.success(
        <>
          Flashcard deck <strong>{generatedName}</strong> created successfully!
        </>,
        {
          duration: 3000,
          icon: '🎉',
        }
      );

      onClose();

    } catch (error: any) {
      console.error("Error creating flashcards:", error);

      if (error.code === 'functions/invalid-argument' && error.message.includes('The concatenated text is too long')) {
        ReactToast.error("The selected content is too long. Please select fewer or shorter notes.", {
          duration: 5000,
          icon: '❌',
        });
      } else if (error.message === "No flashcards could be created from the provided content") {
        ReactToast.error("Unable to create flashcards from the selected content. Please try different notes or contact support.", {
          duration: 5000,
          icon: '❌',
        });
      } else {
        ReactToast.error("An error occurred while creating flashcards. Please try again or contact support.", {
          duration: 3000,
          icon: '❌',
        });
      }
    } finally {
      setLoading(false);
    }
  };


  const getFileEmoji = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const pdfExtensions = ['pdf'];
    const docExtensions = ['doc', 'docx'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const videoExtensions = ['mp4', 'avi', 'mov'];

    if (pdfExtensions.includes(extension)) return "📕";
    if (docExtensions.includes(extension)) return "📘";
    if (audioExtensions.includes(extension)) return "🎵";
    if (videoExtensions.includes(extension)) return "🎥";
    return "📝";
  };


  const toggleNoteSelection = (folderId: string, noteId: string, isChecked: boolean, type: 'note' | 'file') => {
    setSelectedNoteIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(noteId);
      } else {
        newSet.delete(noteId);
      }
      return newSet;
    });

    if (isChecked) {
      setSelectedNotes([...selectedNotes, { folderId, noteId, type }]);
    } else {
      setSelectedNotes(selectedNotes.filter((note) => note.noteId !== noteId || note.folderId !== folderId || note.type !== type));
    }
  };
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default link behavior
    onClose(); // Close the current modal
    onBack();
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="relative flex justify-center items-center mb-4">
            {/* Add back arrow */}
            <button
              onClick={handleBackClick}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-xl font-bold"
            >
              <ArrowLeft size={24} />
            </button>
            <FancyText
              gradient={{ from: '#FE7EF4', to: '#F6B144' }}
              className="text-2xl sm:text-3xl md:text-3xl font-bold text-black"
            >
              Create Flashcards
            </FancyText>
            <button
              onClick={onClose}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xl font-bold"
            >
              &times;
            </button>
          </div>

          <p className="text-center mb-4">Click on the notes and transcripts you would like to use</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {foldersNotes.map((folder) => (
              <div
                key={folder.folderId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
              >
                <h3 className="font-bold mb-2 break-words">{folder.folderName}</h3>
                <ul className="space-y-2">
                  {folder.notes
                    .filter(note => !note.name.toLowerCase().endsWith('.pptx'))
                    .map((note) => {
                      const emoji = getFileEmoji(note.name);
                      const isSelected = selectedNoteIds.has(note.id);

                      return (
                        <li key={note.id} className="flex items-start">
                          <div className="mr-2 mt-1 w-5 h-5 flex items-center justify-center relative">
                            <Checkbox
                              id={`note-${note.id}`}
                              isChecked={isSelected}
                              onChange={(e) =>
                                toggleNoteSelection(
                                  folder.folderId,
                                  note.id,
                                  e.target.checked,
                                  note.type
                                )
                              }
                              className="z-10"
                            />
                            <span
                              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isSelected ? 'opacity-0' : 'opacity-100'
                                }`}
                            >
                              {emoji}
                            </span>
                          </div>
                          <label
                            htmlFor={`note-${note.id}`}
                            className="text-sm break-words cursor-pointer hover:text-[#F6B144] transition-colors duration-200 flex items-center"
                          >
                            {note.name}
                          </label>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center ">
            <div className={`${selectedNotes.length > 0
                ? 'p-[1px] relative'
                : 'p-[1px] relative cursor-not-allowed'
              }`}>
            <Button
              onClick={handleClick}
              className="p-[1px] relative"
              title={
                selectedNotes.length > 0
                  ? ''
                  : 'Click on a note first to create flashcard'
              }
              disabled={loading || selectedNotes.length === 0}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                <motion.div
                  className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white pointer-disabled"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <motion.span
                    className="font-bold inline-block"
                    variants={{
                      hover: { x: -20, opacity: 0 },
                      tap: { scale: 0.95 }
                    }}
                  >
                  {loading ? "Creating..." : (selectedNotes.length > 0 ? 'Create Flashcards' : 'Select Notes First')}

                    
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ x: 20, opacity: 0 }}
                    variants={{
                      hover: { x: 0, opacity: 1 },
                      tap: { scale: 0.95 }
                    }}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="whitespace-nowrap">{creditCost} Credits</span>
                    )}
                  </motion.div>
                  
                </motion.div>
              </Button>
            </div>
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
