"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, fetchAllFiles, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig"; 
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@chakra-ui/react";
import NoCreditsModal from "../subscribe/no-credits-modal";

interface QuizzesComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string; // Add userId prop
}


const QuizzesComponent: React.FC<QuizzesComponentProps> = ({ onClose, workspaceId, userId }) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<NoteReference[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [currentEditQuizId, setCurrentEditQuizId] = useState<string | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false); // State for showing credit modal
  const [creditCost] = useState(10); // Assuming credit cost is 10
  const [remainingCredits, setRemainingCredits] = useState(0); // State to hold remaining credits
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
      return {
        folderId: noteFolder.folderId,
        folderName: noteFolder.folderName,
        notes: [...noteFolder.notes, ...(matchingFileFolder?.notes || [])],
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-3xl ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create Quizzes</h2>
            <button onClick={onClose} className="text-xl font-bold">
              &times;
            </button>
          </div>
          <p className="text-center">Which notes and transcripts would you like to use?</p>
          <ul className="mt-4">
            {foldersNotes.map((folder) => (
              <li key={folder.folderId}>
                <h3 className="font-bold">{folder.folderName}</h3>
                <ul className="pl-4">
                  {folder.notes.map((note) => (
                    <li key={note.id} className="flex items-center">
                      <input
                        aria-label="Select Note"
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => handleCheckboxChange(folder.folderId, note.id, e.target.checked, note.type)}
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
            onClick={handleCreateQuizzes}
            className={`px-4 py-2 rounded-lg ${
              selectedNotes.length > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={loading || selectedNotes.length === 0}
          >
            {loading ? "Creating..." : "Create Study Guides"}
          </button>
          </div>
          {quizzes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Generated Quizzes</h3>
              <ul>
                {quizzes.map((quiz, index) => (
                  <li key={quiz.id} className="flex items-center">
                    <h4 className="font-bold mr-2">{quiz.question}</h4>
                    <button title='Edit Question' onClick={() => handleEditQuestion(quiz.id!, quiz.question)} className="mr-2">
                      <Pencil className="w-5 h-5 text-gray-600" />
                    </button>
                    <button title='Delete Question' onClick={() => handleDeleteQuestion(quiz.id!)}>
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Popup for adding new question */}
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

      {/* Popup for editing existing question */}
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

export default QuizzesComponent;
