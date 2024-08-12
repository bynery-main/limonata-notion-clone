"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig"; 
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

interface QuizzesComponentProps {
  onClose: () => void;
  workspaceId: string;
}

interface Quiz {
  question: string;
}

interface NoteReference {
  folderId: string;
  noteId: string;
}

interface NameGenerationResult {
  success: boolean;
  answer: string;
}

const QuizzesComponent: React.FC<QuizzesComponentProps> = ({ onClose, workspaceId }) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<NoteReference[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await fetchAllNotes(workspaceId);
        setFoldersNotes(fetchedNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchNotes();
  }, [workspaceId]);

  const handleCheckboxChange = (folderId: string, noteId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedNotes([...selectedNotes, { folderId, noteId }]);
    } else {
      setSelectedNotes(selectedNotes.filter((note) => note.noteId !== noteId || note.folderId !== folderId));
    }
  };

  const handleCreateQuizzes = async () => {
    const functions = getFunctions(app);
    const createQuizzes = httpsCallable(functions, "quizGenAgent");
    const generateName = httpsCallable(functions, "nameResource");
  
    setLoading(true);
    try {
      const payload = {
        workspaceId,
        notes: selectedNotes,
      };
      console.log("Payload being passed to quizGenAgent:", payload);
      const result = await createQuizzes(payload);
      console.log("Quizzes created successfully:", result.data);
  
      const data = result.data as { answer: string };
      const raw = data.answer || "";
  
      // Log the raw data before parsing
      console.log("Raw data received from cloud function:", raw);
  
      // Parse raw data into quizzes
      const parsedQuizzes = parseRawDataToQuizzes(raw);
      setQuizzes(parsedQuizzes);
  
      // Generate a name for the quiz set using the nameResource function
      const nameGenerationResult = await generateName({ content: raw });
      const generatedName = (nameGenerationResult.data as NameGenerationResult).answer;
  
      console.log("Generated name for quiz set:", generatedName);
  
      // Create a new quiz set with the generated name and save it to Firestore
      const quizSetRef = doc(collection(db, "workspaces", workspaceId, "quizSets"));
      await setDoc(quizSetRef, { name: generatedName, notes: selectedNotes });
  
      // Save each quiz to Firestore under the new quiz set
      const quizzesCollectionRef = collection(quizSetRef, "quizzes");
      for (const quiz of parsedQuizzes) {
        await addDoc(quizzesCollectionRef, { question: quiz.question });
      }
    } catch (error) {
      console.error("Error creating quizzes:", error);
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
      quizzes.push({ question: match[1].trim() });
    }

    console.log("Quizzes parsed:", quizzes); 
    return quizzes;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-3xl ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Quizzes</h2>
          <button onClick={onClose} className="text-xl font-bold">
            &times;
          </button>
        </div>
        <p className="text-center">Which notes would you like to use?</p>
        <ul className="mt-4">
          {foldersNotes.map((folder) => (
            <li key={folder.folderId}>
              <h3 className="font-bold">{folder.folderName}</h3>
              <ul className="pl-4">
                {folder.notes.map((note) => (
                  <li key={note.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => handleCheckboxChange(folder.folderId, note.id, e.target.checked)}
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Quizzes"}
          </button>
        </div>
        {quizzes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Generated Quizzes</h3>
            <ul>
              {quizzes.map((quiz, index) => (
                <li key={index}>
                  <h4 className="font-bold">{quiz.question}</h4>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesComponent;
