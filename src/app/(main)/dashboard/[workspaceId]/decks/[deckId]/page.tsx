"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { FlashCardArray } from "react-flashcards";
import { CSSProperties } from 'react';
import { Pencil, Trash2, PlusCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface Flashcard {
  firestoreId: string; // Firestore ID as a string
  id: number; // Keep the ID as a number for FlashCardArray compatibility
  timerDuration: number;
  front: string;
  back: string;
  isMarkdown?: boolean;
  frontStyle?: CSSProperties;
  backStyle?: CSSProperties;
  currentIndex: number;
  label: string;
  showTextToSpeech?: boolean;
}

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [currentEditFlashcardId, setCurrentEditFlashcardId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const params = useParams();

  const workspaceId = params?.workspaceId as string;
  const deckId = params?.deckId as string;

  useEffect(() => {
    if (!workspaceId || !deckId) return;

    const fetchData = async () => {
      const flashcardsCollectionRef = collection(db, "workspaces", workspaceId, "flashcardsDecks", deckId, "flashcards");
      const flashcardsSnapshot = await getDocs(flashcardsCollectionRef);
      const fetchedFlashcards: Flashcard[] = flashcardsSnapshot.docs.map((doc, index) => ({
        firestoreId: doc.id, // Firestore document ID as string
        id: index + 1, // Use index as number ID for FlashCardArray
        timerDuration: 10, // Default value, adjust as needed
        front: doc.data().question as string, // Ensure front is a string
        back: doc.data().answer as string, // Ensure back is a string
        isMarkdown: false,
        frontStyle: {},
        backStyle: {},
        currentIndex: index,
        label: `Card ${index + 1}`,
        showTextToSpeech: false,
      }));

      console.log("Fetched flashcards:", fetchedFlashcards);
      setFlashcards(fetchedFlashcards);
    };

    fetchData();
  }, [workspaceId, deckId]);

  const fetchFlashcards = async () => {
    const flashcardsCollectionRef = collection(db, "workspaces", workspaceId, "flashcardsDecks", deckId, "flashcards");
    const flashcardsSnapshot = await getDocs(flashcardsCollectionRef);
    const fetchedFlashcards: Flashcard[] = flashcardsSnapshot.docs.map((doc, index) => ({
      firestoreId: doc.id, // Firestore document ID as string
      id: index + 1, // Use index as number ID for FlashCardArray
      timerDuration: 10,
      front: doc.data().question as string,
      back: doc.data().answer as string,
      isMarkdown: false,
      frontStyle: {},
      backStyle: {},
      currentIndex: index,
      label: `Card ${index + 1}`,
      showTextToSpeech: false,
    }));

    setFlashcards(fetchedFlashcards);
  };

  const handleAddFlashcard = () => {
    console.log("Add button clicked");
    setIsAddPopupOpen(true);
  };

  const handleAddPopupSubmit = async () => {
    if (newQuestion && newAnswer) {
      try {
        const flashcardsCollectionRef = collection(db, "workspaces", workspaceId, "flashcardsDecks", deckId, "flashcards");
        await addDoc(flashcardsCollectionRef, { question: newQuestion, answer: newAnswer });
        
        // Fetch flashcards again after adding a new one
        await fetchFlashcards();

        setNewQuestion("");
        setNewAnswer("");
        setIsAddPopupOpen(false);
      } catch (error) {
        console.error("Error adding flashcard:", error);
      }
    }
  };

  const handleDeleteFlashcard = async () => {
    const firestoreId = flashcards[currentIndex].firestoreId;
    console.log(`Delete button clicked for flashcard ID: ${firestoreId}`);

    try {
      const flashcardDocRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", deckId, "flashcards", firestoreId);
      await deleteDoc(flashcardDocRef);

      setFlashcards(flashcards.filter((_, index) => index !== currentIndex));
      setCurrentIndex((prevIndex) => prevIndex === 0 ? 0 : prevIndex - 1);
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    }
  };

  const handleEditFlashcard = () => {
    const firestoreId = flashcards[currentIndex].firestoreId;
    console.log(`Edit button clicked for flashcard ID: ${firestoreId}`);
    setCurrentEditFlashcardId(firestoreId);
    setNewQuestion(flashcards[currentIndex].front);
    setNewAnswer(flashcards[currentIndex].back);
    setIsEditPopupOpen(true);
  };

  const handleEditPopupSubmit = async () => {
    console.log(`Submit button clicked for editing flashcard ID: ${currentEditFlashcardId}`);
    if (currentEditFlashcardId && newQuestion && newAnswer) {
      try {
        const flashcardDocRef = doc(db, "workspaces", workspaceId, "flashcardsDecks", deckId, "flashcards", currentEditFlashcardId);
        await updateDoc(flashcardDocRef, { question: newQuestion, answer: newAnswer });

        setFlashcards(flashcards.map(flashcard => 
          flashcard.firestoreId === currentEditFlashcardId 
            ? { ...flashcard, front: newQuestion, back: newAnswer } 
            : flashcard
        ));

        setNewQuestion("");
        setNewAnswer("");
        setIsEditPopupOpen(false);
      } catch (error) {
        console.error("Error updating flashcard:", error);
      }
    }
  };

  const handleNextFlashcard = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      if (newIndex < flashcards.length) {
        return newIndex;
      }
      return prevIndex;
    });
  };

  const handlePreviousFlashcard = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      if (newIndex >= 0) {
        return newIndex;
      }
      return prevIndex;
    });
  };

  if (!workspaceId || !deckId) {
    return <p>Invalid workspace or flashcard deck.</p>;
  }

  return (
    <div className="flex flex-col items-center h-full w-full">
      <h1>Flashcards</h1>
      {flashcards.length > 0 ? (
        <div style={{ width: '700px', height: '800px' }}>
          <FlashCardArray
            cards={flashcards}
            label="Flashcards"
            timerDuration={10}
            showCount={true}
            autoPlay={false}
            cycle={true}
            width="100%"
            frontStyle={{ backgroundColor: '#f0f0f0', padding: '20px' }}
            backStyle={{ backgroundColor: '#e0e0e0', padding: '20px' }}
          />
          <div className="mt-4 flex items-center justify-center gap-4">
            <button onClick={handlePreviousFlashcard} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={handleEditFlashcard} className="text-gray-600">
              <Pencil className="w-5 h-5" />
            </button>
            <button onClick={handleDeleteFlashcard} className="text-red-500">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={handleAddFlashcard} className="text-blue-500">
              <PlusCircle className="w-5 h-5" />
            </button>
            <button onClick={handleNextFlashcard} className="text-gray-600">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <p>No flashcards available.</p>
      )}

      {/* Popup for adding a new flashcard */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">New Flashcard</h2>
            <textarea
              className="w-full p-3 mb-4 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter answer..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setIsAddPopupOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={handleAddPopupSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for editing an existing flashcard */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Edit Flashcard</h2>
            <textarea
              className="w-full p-3 mb-4 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit answer..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setIsEditPopupOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={handleEditPopupSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
