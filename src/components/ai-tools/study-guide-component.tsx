"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { Button, Checkbox, useToast as useChakraToast, useToast } from "@chakra-ui/react";
import NoCreditsModal from "../subscribe/no-credits-modal";
import reacttoast from 'react-hot-toast';
import { useRouter } from 'next/navigation'
import FancyText from '@carefully-coded/react-text-gradient';
import { title } from "process";
import CostButton from "./cost-button";
import { motion } from "framer-motion";
import { Loader, Loader2 } from "lucide-react";

interface StudyGuideComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string; // Add userId prop
}

const allowedFileExtensions = ["pdf", "docx", "ppt", "pptx", "mp3", "wav"]; // List of allowed extensions

const StudyGuideComponent: React.FC<StudyGuideComponentProps> = ({
  onClose,
  workspaceId,
  userId,
}) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<NoteReference[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false); // State for showing credit modal
  const [creditCost] = useState(20); // Assuming credit cost is 20
  const [remainingCredits, setRemainingCredits] = useState(0); // State to hold remaining credits
  const toast = useToast();
  const chakraToast = useChakraToast();
  const router = useRouter();
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const isDisabled = loading || selectedNotes.length === 0;

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
    const createStudyGuides = httpsCallable(functions, "studyGuideAgent");
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

      // If credit usage was successful, proceed with study guide creation
      const result = await createStudyGuides({
        workspaceId,
        notes,
        files, // Add files to the payload
      });
      console.log("Study guides created successfully:", result.data);

      const data = result.data as { answer: string };
      const raw = data.answer || "";

      console.log("Raw data received from cloud function:", raw);

      const parsedStudyGuides = parseRawDataToStudyGuides(raw);
      setStudyGuides(parsedStudyGuides);

      // Generate a name for the study guide using the nameResource function
      const nameGenerationResult = await generateName({ content: raw });
      const generatedName = (nameGenerationResult.data as NameGenerationResult)
        .answer;

      console.log("Generated name for study guide:", generatedName);

      // Create a new study guide document with the generated name and save it to Firestore
      const studyGuidesCollectionRef = collection(
        db,
        "workspaces",
        workspaceId,
        "studyGuides"
      );
      const guideDoc = doc(studyGuidesCollectionRef);
      await setDoc(guideDoc, {
        name: generatedName,
        content: raw,
        notes: selectedNotes,
      });

      reacttoast.success("Study guides created successfully", {
        duration: 3000,
        icon: '🎉',
      });
      chakraToast({
        title: "Success",
        description: "Study guides created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to dashboard/workspaceid after a short delay
      setTimeout(() => {
        router.push(`/dashboard/${workspaceId}`);
      });

    } catch (error) {
      console.error("Error creating study guides:", error);
      reacttoast.error("An error occurred while creating study guides", {
        duration: 3000,
        icon: '❌',
      });
      chakraToast({
        title: "Error",
        description: "An error occurred while creating study guides",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      onClose();
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
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="relative flex justify-center items-center mb-4">
            <FancyText
              gradient={{ from: '#FE7EF4', to: '#F6B144' }}
              className="text-2xl sm:text-3xl md:text-3xl font-bold text-black"
            >
              Create Study Guides
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
      onClick={handleCreateStudyGuides}
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
        </div>
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