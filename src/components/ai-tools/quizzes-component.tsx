"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Button, Checkbox } from "@chakra-ui/react";
import ReactToast from "react-hot-toast";
import NoCreditsModal from "../subscribe/no-credits-modal";
import FancyText from '@carefully-coded/react-text-gradient';
import CostButton from "./cost-button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface QuizzesComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string;
  onBack: () => void;
}

const allowedFileExtensions = ["pdf", "docx", "ppt", "pptx", "mp3", "wav"]; // Allowed extensions

const QuizzesComponent: React.FC<QuizzesComponentProps> = ({ onClose, workspaceId, userId, onBack }) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<NoteReference[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [currentEditQuizId, setCurrentEditQuizId] = useState<string | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditCost] = useState(10);
  const [remainingCredits, setRemainingCredits] = useState(0);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const isDisabled = loading || selectedNotes.length === 0;

  interface Note {
    id: string;
    name: string;
    type: 'note' | 'file';
  }

  interface Folder {
    folderId: string;
    folderName: string;
    notes: Note[];
  }
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

  const handleCreateQuizzes = async () => {
    const functions = getFunctions(app);
    const createQuizzes = httpsCallable(functions, "quizGenAgent", {timeout: 240000});
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

      // If credit usage was successful, proceed with quiz creation
      const payload = {
        workspaceId,
        notes,
        files, // Add files to the payload
      };
      console.log("Payload being passed to quizGenAgent:", payload);
      const result = await createQuizzes(payload);
      console.log("Quizzes created successfully:", result.data);

      const data = result.data as { answer: string };
      const raw = data.answer || "";

      console.log("Raw data received from cloud function:", raw);

      const parsedQuizzes = parseRawDataToQuizzes(raw);
      setQuizzes(parsedQuizzes);

      const nameGenerationResult = await generateName({ content: raw });
      const generatedName = (nameGenerationResult.data as NameGenerationResult).answer;

      console.log("Generated name for quiz set:", generatedName);

      const quizSetsCollectionRef = collection(db, "workspaces", workspaceId, "quizSets");
      const quizSetDocRef = await addDoc(quizSetsCollectionRef, { name: generatedName, notes: selectedNotes });

      const quizzesCollectionRef = collection(quizSetDocRef, "quizzes");
      for (const quiz of parsedQuizzes) {
        await addDoc(quizzesCollectionRef, { question: quiz.question });
      }

      ReactToast.success(
        <>
          Quiz <strong>{generatedName}</strong> created successfully!
        </>, {
        duration: 3000,
        icon: '🎉',
      });

    } catch (error) {
      console.error("Error creating quizzes:", error);
      ReactToast.error("An error occurred while creating quizzes. Try again or contact support.");

    } finally {
      setLoading(false);
      onClose();
    }
  };

  const parseRawDataToQuizzes = (rawData: string): Quiz[] => {
    console.log("Data received by parser:", rawData);
    const quizzes: Quiz[] = [];
    const quizRegex = /Question \d+: ([\s\S]+?)(?=\nQuestion \d+:|$)/g;
    let match;
    while ((match = quizRegex.exec(rawData)) !== null) {
      quizzes.push({ id: '', question: match[1].trim() });
    }

    console.log("Quizzes parsed:", quizzes);
    return quizzes;
  };

  const handleAddQuestion = () => {
    setIsAddPopupOpen(true);
  };

  const handlePopupSubmit = async () => {
    if (newQuestion) {
      try {
        const quizzesCollectionRef = collection(db, "workspaces", workspaceId, "quizSets", "quizzes");
        const quizDocRef = await addDoc(quizzesCollectionRef, { question: newQuestion });

        setQuizzes([...quizzes, { id: quizDocRef.id, question: newQuestion }]);
        setNewQuestion("");
        setIsAddPopupOpen(false);
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
  };

  const handleEditPopupSubmit = async () => {
    console.log(`Submit button clicked for editing quiz ID: ${currentEditQuizId}, New Question: ${newQuestion}`);
    if (currentEditQuizId && newQuestion) {
      try {
        const quizDocRef = doc(db, "workspaces", workspaceId, "quizSets", "quizzes", currentEditQuizId);
        console.log(`Updating Firestore document for quiz ID: ${currentEditQuizId} with new question: ${newQuestion}`);
        await updateDoc(quizDocRef, { question: newQuestion });

        setQuizzes(quizzes.map(quiz => quiz.id === currentEditQuizId ? { ...quiz, question: newQuestion } : quiz));
        setNewQuestion("");
        setIsEditPopupOpen(false);
      } catch (error) {
        console.error("Error updating question:", error);
      }
    }
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
              Create Quizzes
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
      onClick={handleCreateQuizzes}
      className="p-[1px] relative"
      title={
        selectedNotes.length > 0
          ? 'Create Quizzes'
          : 'Click on a note first to create a Quiz'
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
          {loading ? "Creating..." : "Create Quizzes"}
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
          {/*  
      PREVIEW STUDY GUIDE
      {quizzes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Generated Study Guide</h3>
            <ul>
              {quizzes.map((guide, index) => (
                <li key={index}>
                  <h4 className="font-bold">{quiz.name}</h4>
                  <ReactMarkdown>{guide.content}</ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        )} */}
        </div>
      </div>

      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">New Question</h2>
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsAddPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePopupSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsEditPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPopupSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

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

export default QuizzesComponent;