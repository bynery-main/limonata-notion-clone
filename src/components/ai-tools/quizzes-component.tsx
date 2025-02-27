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
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import studyGuideTips from "./study-guide-loading-tips";

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
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [currentTip, setCurrentTip] = useState<string>("");
  const router = useRouter();
  const isDisabled = loading || selectedNotes.length === 0;

  // Function to get a random tip
  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * studyGuideTips.length);
    return studyGuideTips[randomIndex];
  };
  
  // Set up tip rotation with random selection
  useEffect(() => {
    if (!showLoadingScreen) return;
    
    // Set initial random tip
    setCurrentTip(getRandomTip());
    
    // Rotate to new random tips every 6 seconds
    const tipInterval = setInterval(() => {
      // Get a new random tip that's different from the current one
      let newTip = getRandomTip();
      while (newTip === currentTip && studyGuideTips.length > 1) {
        newTip = getRandomTip();
      }
      setCurrentTip(newTip);
    }, 6000);
    
    return () => clearInterval(tipInterval);
  }, [showLoadingScreen, currentTip]);

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
    const createQuizzes = httpsCallable(functions, "quizGenAgent", { timeout: 240000 });
    const generateName = httpsCallable(functions, "nameResource");
    const creditValidation = httpsCallable(functions, "useCredits");

    setLoading(true);
    setShowLoadingScreen(true);
    
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
        setShowLoadingScreen(false);
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
      const quizSetId = quizSetDocRef.id;

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

      // Close the modal
      onClose();

      // Redirect to the specific quiz set page
      router.push(`/dashboard/${workspaceId}/quizzes/${quizSetId}`);

    } catch (error) {
      console.error("Error creating quizzes:", error);
      ReactToast.error("An error occurred while creating quizzes. Try again or contact support.");

    } finally {
      setLoading(false);
      setShowLoadingScreen(false);
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
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    handleCreateQuizzes();
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <AnimatePresence mode="wait">
          {showLoadingScreen ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white/90 dark:bg-neutral-800/90 backdrop-filter backdrop-blur-md rounded-lg p-6 w-11/12 max-w-4xl h-[500px] flex flex-col items-center justify-center shadow-xl"
              style={{ minHeight: "500px" }} // Ensure consistent height
            >
              <motion.div 
                className="mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <motion.img 
                  src="/favicon.ico" 
                  alt="Loading" 
                  className="w-24 h-24"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </motion.div>
              <motion.p 
                className="text-xl font-medium text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Creating your quizzes...
              </motion.p>
              
              <motion.div
                className="max-w-md text-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTip}
                    className="text-sm text-gray-600 dark:text-gray-300 italic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-[#F6B144] font-medium">Study Tip:</span> {currentTip}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 dark:bg-neutral-800/95 backdrop-filter backdrop-blur-sm rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
              style={{ minHeight: "300px" }} // Match the loading screen height
            >
              <div className="relative flex justify-center items-center mb-4">
                <motion.button
                  onClick={handleBackClick}
                  className="absolute left-0 text-xl font-bold flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <FancyText
                  gradient={{ from: '#FE7EF4', to: '#F6B144' }}
                  className="text-2xl sm:text-3xl md:text-3xl font-bold text-black"
                >
                  Create Quizzes
                </FancyText>
                <motion.button
                  onClick={onClose}
                  className="absolute right-0  text-xl font-bold flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  &times;
                </motion.button>
              </div>

              <p className="text-center mb-4">Click on the notes and transcripts you would like to use</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {foldersNotes.map((folder, folderIndex) => (
                  <motion.div
                    key={folder.folderId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: folderIndex * 0.05, duration: 0.3 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                    whileHover={{ boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                  >
                    <h3 className="font-bold mb-2 break-words">{folder.folderName}</h3>
                    <ul className="space-y-2">
                      {folder.notes
                        .filter(note => !note.name.toLowerCase().endsWith('.pptx'))
                        .map((note, noteIndex) => {
                          const emoji = getFileEmoji(note.name);
                          const isSelected = selectedNoteIds.has(note.id);

                          return (
                            <motion.li 
                              key={note.id} 
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (folderIndex * 0.05) + (noteIndex * 0.02), duration: 0.2 }}
                              whileHover={{ x: 2 }}
                            >
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
                                <motion.span
                                  className="absolute inset-0 flex items-center justify-center"
                                  animate={{ 
                                    opacity: isSelected ? 0 : 1,
                                    scale: isSelected ? 0.8 : 1
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {emoji}
                                </motion.span>
                              </div>
                              <label
                                htmlFor={`note-${note.id}`}
                                className="text-sm break-words cursor-pointer hover:text-[#F6B144] transition-colors duration-200 flex items-center"
                              >
                                {note.name}
                              </label>
                            </motion.li>
                          );
                        })}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mt-4 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
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
                      : 'Click on a note first to create quiz'
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
                      {loading ? "Creating..." : (selectedNotes.length > 0 ? 'Create Quiz' : 'Select Notes First')}
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm"
          >
            <h2 className="text-xl font-semibold mb-4">New Question</h2>
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <motion.button
                onClick={() => setIsAddPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handlePopupSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <motion.button
                onClick={() => setIsEditPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleEditPopupSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
            </div>
          </motion.div>
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