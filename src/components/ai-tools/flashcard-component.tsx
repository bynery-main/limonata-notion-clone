"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import Flashcards from "./flashcards";
import { BookOpen, Loader2, StarsIcon } from "lucide-react";
import { Checkbox } from "@chakra-ui/checkbox";
import { Button, useToast } from "@chakra-ui/react";
import NoCreditsModal from "../subscribe/no-credits-modal";
import FancyText from '@carefully-coded/react-text-gradient';
import CostButton from "./cost-button";
import { motion } from "framer-motion";

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
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

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
      onClose();
      toast({
        title: "Flashcards Created",
        description: "Your flashcards have been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
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
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="relative flex justify-center items-center mb-4">
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
                  {folder.notes.map((note) => {
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

          <div className="mt-4 flex justify-center">
            <div className={`${selectedNotes.length > 0
                ? 'p-[1px] relative'
                : 'p-[1px] relative cursor-not-allowed'
              }`}>
                  <Button
      onClick={handleCreateFlashcards}
      className="p-[1px] relative"
      title={
        selectedNotes.length > 0
          ? 'Create Flashcards'
          : 'Click on a note first to create Flashcards'
      }
      disabled={isDisabled}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full ${isDisabled ? 'opacity-50' : ''}`} />
      <motion.div
        className={`px-3 py-2 relative rounded-full group transition duration-200 text-sm ${
          isDisabled ? 'bg-gray-200 text-gray-500' : 'bg-white text-black hover:bg-transparent hover:text-white'
        }`}
        whileHover={isDisabled ? {} : "hover"}
        whileTap={isDisabled ? {} : "tap"}
      >
        <motion.span
          className="font-bold inline-block"
          variants={{
            hover: { x: -20, opacity: 0 },
            tap: { scale: 0.95 }
          }}
        >
          {loading ? "Creating..." : "Create Flashcards"}
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
