"use client";

import React, { useEffect, useState } from "react";
import { fetchAllNotes, FolderNotes } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/firebase/firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@chakra-ui/react";

interface StudyGuideComponentProps {
  onClose: () => void;
  workspaceId: string;
  userId: string; // Add userId prop
}

interface StudyGuide {
  name: string;
  content: string;
}

interface NameGenerationResult {
  success: boolean;
  answer: string;
}

interface CreditUsageResult {
  success: boolean;
  message: string;
  remainingCredits: number;
}

const StudyGuideComponent: React.FC<StudyGuideComponentProps> = ({ onClose, workspaceId, userId }) => {
  const [foldersNotes, setFoldersNotes] = useState<FolderNotes[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<{ folderId: string; noteId: string }[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      const fetchedNotes = await fetchAllNotes(workspaceId);
      setFoldersNotes(fetchedNotes);
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

  const handleCreateStudyGuides = async () => {
    const functions = getFunctions(app);
    const createStudyGuides = httpsCallable(functions, "studyGuideAgent");
    const generateName = httpsCallable(functions, "nameResource");
    const useCredits = httpsCallable(functions, "useCredits");
  
    setLoading(true);
    try {
      // First, attempt to use credits
      const creditUsageResult = (await useCredits({
        uid: userId,
        cost: 20,
      })) as { data: CreditUsageResult };

      console.log("Credit usage result:", creditUsageResult.data);

      if (!creditUsageResult.data.success) {
        toast({
          title: "Error",
          description: creditUsageResult.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // If credit usage was successful, proceed with study guide creation
      const result = await createStudyGuides({
        workspaceId,
        notes: selectedNotes,
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
      const studyGuidesCollectionRef = collection(db, "workspaces", workspaceId, "studyGuides");
      const guideDoc = doc(studyGuidesCollectionRef);
      await setDoc(guideDoc, { name: generatedName, content: raw, notes: selectedNotes });

      toast({
        title: "Success",
        description: "Study guides created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating study guides:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating study guides",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };  

  const parseRawDataToStudyGuides = (rawData: string): StudyGuide[] => {
    console.log("Data received by parser:", rawData);
    const studyGuides: StudyGuide[] = [];
    const guideRegex = /Study Guide \d+: Title: ([\s\S]+?) Content: ([\s\S]+?)(?=\nStudy Guide \d+:|$)/g;
    let match;
    while ((match = guideRegex.exec(rawData)) !== null) {
      studyGuides.push({ name: match[1].trim(), content: match[2].trim() });
    }

    console.log("Study Guides parsed:", studyGuides);
    return studyGuides;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Study Guides</h2>
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
                      aria-label="View Note"
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
            onClick={handleCreateStudyGuides}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Study Guides"}
          </button>
        </div>
        {studyGuides.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Generated Study Guides</h3>
            <ul>
              {studyGuides.map((guide, index) => (
                <li key={index}>
                  <h4 className="font-bold">{guide.name}</h4>
                  <ReactMarkdown>{guide.content}</ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGuideComponent;