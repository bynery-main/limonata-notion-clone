"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig"; 
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";
import { Checkbox, useToast } from "@chakra-ui/react";
import NoCreditsModal from "../subscribe/no-credits-modal";
import FancyText from '@carefully-coded/react-text-gradient';

interface QuizzesComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string;
}

const allowedFileExtensions = ["pdf", "docx", "ppt", "pptx", "mp3", "wav"]; // Allowed extensions

const QuizzesComponent: React.FC<QuizzesComponentProps> = ({ onClose, workspaceId, userId }) => {
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
  const toast = useToast();

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

  const handleCheckboxChange = (folderId: string, noteId: string, isChecked: boolean, type: 'note' | 'file') => {
    if (isChecked) {
      setSelectedNotes([...selectedNotes, { folderId, noteId, type }]);
    } else {
      setSelectedNotes(selectedNotes.filter((note) => note.noteId !== noteId || note.folderId !== folderId || note.type !== type));
    }
  };

  const handleCreateQuizzes = async () => {
    const functions = getFunctions(app);
    const createQuizzes = httpsCallable(functions, "quizGenAgent");
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

      toast({
        title: "Success",
        description: "Quizzes created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating quizzes:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating quizzes",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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

  const handleDeleteQuestion = async (quizId: string) => {
    try {
      const quizDocRef = doc(db, "workspaces", workspaceId, "quizSets", "quizzes", quizId);
      await deleteDoc(quizDocRef);

      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleEditQuestion = (quizId: string, currentQuestion: string) => {
    console.log(`Edit button clicked for quiz ID: ${quizId}, Current Question: ${currentQuestion}`);
    setCurrentEditQuizId(quizId);
    setNewQuestion(currentQuestion);
    setIsEditPopupOpen(true);
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-3xl">
          <div className="relative flex justify-center items-center mb-4">
            <FancyText 
              gradient={{ from: '#FE7EF4', to: '#F6B144' }} 
              className="text-2xl sm:text-3xl md:text-3xl font-bold text-black font-extrabold"
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {foldersNotes.map((folder) => (
              <div
                key={folder.folderId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
              >
                <h3 className="font-bold mb-2 break-words">{folder.folderName}</h3>
                <ul className="space-y-2">
                  {folder.notes.map((note) => (
                    <li key={note.id} className="flex items-start">
                      <Checkbox
                        id={`note-${note.id}`}
                        onChange={(e) =>
                          handleCheckboxChange(
                            folder.folderId,
                            note.id,
                            e.target.checked,
                            note.type
                          )
                        }
                        color={note.type === 'note' ? ['#FE7EF4'] : ['#F6B144']}
                        className="mr-2 mt-1"
                      />
                      <label
                        htmlFor={`note-${note.id}`}
                        className="text-sm break-words cursor-pointer"
                      >
                        {note.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <button
              onClick={handleCreateQuizzes}
              className={`p-[1px] relative ${
                selectedNotes.length > 0
                  ? 'p-[1px] relative'
                  : 'p-[1px] relative cursor-not-allowed'
              }`}
              title={
                selectedNotes.length > 0
                  ? ''
                  : 'Click on a note first to create study guide'
              }
              disabled={loading || selectedNotes.length === 0}
            >
              <span className="font-bold">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white">
                  {loading ? "Creating..." : "Create Study Guide"}
                </div>
              </span>
            </button>
          {quizzes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Generated Quizzes</h3>
              <ul className="space-y-4">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="border-t pt-4 flex items-center justify-between">
                    <h4 className="font-bold mr-2">{quiz.question}</h4>
                    <div>
                      <button title='Edit Question' onClick={() => handleEditQuestion(quiz.id!, quiz.question)} className="mr-2">
                        <Pencil className="w-5 h-5 text-gray-600" />
                      </button>
                      <button title='Delete Question' onClick={() => handleDeleteQuestion(quiz.id!)}>
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
