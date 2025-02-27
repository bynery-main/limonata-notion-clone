"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { Button, Checkbox } from "@chakra-ui/react";
import NoCreditsModal from "../subscribe/no-credits-modal";
import reacttoast from 'react-hot-toast';
import { useRouter } from 'next/navigation'
import FancyText from '@carefully-coded/react-text-gradient';
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import studyGuideTips from "./study-guide-loading-tips";

interface StudyGuideComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string; // Add userId prop
  onBack: () => void; // Optional onBack prop
}

const allowedFileExtensions = ["pdf", "docx", "ppt", "pptx", "mp3", "wav"]; // List of allowed extensions

const StudyGuideComponent: React.FC<StudyGuideComponentProps> = ({
  onClose,
  workspaceId,
  userId,
  onBack,
}) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<NoteReference[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false); // State for showing credit modal
  const [creditCost] = useState(20); // Assuming credit cost is 20
  const [remainingCredits, setRemainingCredits] = useState(0); // State to hold remaining credits
  const router = useRouter();
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const isDisabled = loading || selectedNotes.length === 0;
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [currentTip, setCurrentTip] = useState<string>("");

  interface Note {
    id: string;
    name: string;
    type: 'note' | 'file';
  }


  useEffect(() => {
    const fetchNotesAndFiles = async () => {
      const fetchedNotes = await fetchAllNotes(workspaceId);
      const fetchedFiles = await fetchAllFiles(workspaceId);
      const combinedFoldersNotes = mergeNotesAndFiles(fetchedNotes, fetchedFiles);
      setFoldersNotes(combinedFoldersNotes);
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

  const handleCreateStudyGuides = async () => {
    const functions = getFunctions(app);
    const createStudyGuides = httpsCallable(functions, "studyGuideAgent", { timeout: 240000 });
    const generateName = httpsCallable(functions, "nameResource");
    const creditValidation = httpsCallable(functions, "useCredits");

    setLoading(true);
    setShowLoadingScreen(true);
    
    try {
      // First, attempt to use credits
      const creditUsageResult = await creditValidation({
        uid: userId,
        cost: creditCost,
      }) as { data: CreditUsageResult };

      console.log("Credit usage result:", creditUsageResult.data);

      if (!creditUsageResult.data.success) {
        setRemainingCredits(creditUsageResult.data.remainingCredits);
        setShowCreditModal(true);
        setLoading(false);
        setShowLoadingScreen(false);
        return; // Exit the function here, keeping the AI chat modal open
      }

      // Separate notes and files from selectedNotes
      const notes = selectedNotes.filter(note => note.type === 'note').map(note => ({ folderId: note.folderId, noteId: note.noteId }));
      const files = selectedNotes.filter(note => note.type === 'file').map(note => ({ folderId: note.folderId, fileId: note.noteId }));

      // If credit usage was successful, proceed with study guide creation
      const result = await createStudyGuides({
        workspaceId,
        notes,
        files,
      });
      console.log("Study guides created successfully:", result.data);

      const data = result.data as { answer: string };
      const raw = data.answer || "";

      console.log("Raw data received from cloud function:", raw);

      const parsedStudyGuides = parseRawDataToStudyGuides(raw);
      setStudyGuides(parsedStudyGuides);

      // Generate a name for the study guide using the nameResource function
      const nameGenerationResult = await generateName({ content: raw });
      const generatedName = (nameGenerationResult.data as NameGenerationResult).answer;

      console.log("Generated name for study guide:", generatedName);

      // Create a new study guide document with the generated name and save it to Firestore
      const studyGuidesCollectionRef = collection(
        db,
        "workspaces",
        workspaceId,
        "studyGuides"
      );
      const guideDoc = doc(studyGuidesCollectionRef);
      const studyGuideId = guideDoc.id; // Get the auto-generated ID
      
      await setDoc(guideDoc, {
        name: generatedName,
        content: raw,
        notes: selectedNotes,
      });

      reacttoast.success(<>
        Study Guide <strong>{generatedName}</strong> created successfully!
      </>, {
        duration: 3000,
        icon: '🎉',
      });

      // Close the modal
      onClose();

      // Redirect to the specific study guide page
      router.push(`/dashboard/${workspaceId}/studyguides/${studyGuideId}`);

    } catch (error) {
      console.error("Error creating study guides:", error);
      reacttoast.error("An error occurred while creating study guides. Try again or contact support.", {
        duration: 3000,
        icon: '❌',
      });
      // Don't close the modal on error, allow the user to try again
    } finally {
      setLoading(false);
      setShowLoadingScreen(false);
    }
  };


  const parseRawDataToStudyGuides = (rawData: string): StudyGuide[] => {
    console.log("Data received by parser:", rawData);
    const studyGuides: StudyGuide[] = [];
    const guideRegex =
      /Study Guide \d+: Title: ([\s\S]+?) Content: ([\s\S]+?)(?=\nStudy Guide \d+:|$)/g;
    let match;
    while ((match = guideRegex.exec(rawData)) !== null) {
      studyGuides.push({ name: match[1].trim(), content: match[2].trim() });
    }

    console.log("Study Guides parsed:", studyGuides);
    return studyGuides;
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    handleCreateStudyGuides();
  };

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
                Creating your study guide...
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
                {/* Add back arrow */}
                <motion.button
                  onClick={handleBackClick}
                  className="absolute left-0 text-xl font-bold"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <FancyText
                  gradient={{ from: '#FE7EF4', to: '#F6B144' }}
                  className="text-2xl sm:text-3xl md:text-3xl font-bold text-black"
                >
                  Create Study Guides
                </FancyText>
                <motion.button
                  onClick={onClose}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xl font-bold"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
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
                        : 'Click on a note first to create Study Guide'
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
                        {loading ? "Creating..." : (selectedNotes.length > 0 ? 'Create Study Guide' : 'Select Notes First')}
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

              {studyGuides.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">Generated Study Guide</h3>
                  <ul className="space-y-4">
                    {studyGuides.map((guide, index) => (
                      <li key={index} className="border-t pt-4">
                        <h4 className="font-bold mb-2">{guide.name}</h4>
                        <ReactMarkdown className="prose dark:prose-invert">
                          {guide.content}
                        </ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

export default StudyGuideComponent;