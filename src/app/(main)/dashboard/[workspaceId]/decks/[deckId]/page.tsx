"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { FlashCardArray } from "react-flashcards";
import { Flashcard } from "./interfaces";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import FancyText from "@carefully-coded/react-text-gradient";

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [currentEditFlashcardId, setCurrentEditFlashcardId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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


  if (!workspaceId || !deckId) {
    return <p>Invalid workspace or flashcard deck.</p>;
  }

  return (
    <div className="flex flex-col items-center p-4 min-h-screen w-full">
      {flashcards.length > 0 ? (
        <div className="w-full max-w-3xl">
          <div className=" w-full">
            <FlashCardArray
              cards={flashcards}
              label="Flashcards"
              timerDuration={10}
              showCount={true}
              autoPlay={false}
              cycle={true}
              width="100%"
              onCardChange={(index) => setCurrentIndex(index - 1)}
              frontStyle={{ backgroundColor: '#f0f0f0', padding: '20px' }}
              backStyle={{ backgroundColor: '#e0e0e0', padding: '20px' }}
            />
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <button onClick={handleEditFlashcard} className="hover:text-yellow-500" title="Edit">
              <Pencil className="w-5 h-5" />
            </button>
            <button onClick={handleDeleteFlashcard} className="hover:text-red-500" title="Delete">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={handleAddFlashcard} className="hover:text-blue-500" title="Add Card">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center">No flashcards available.</p>
      )}

      {/* Popup for adding a new flashcard */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-center">
              <FancyText
                gradient={{ from: "#FE7EF4", to: "#F6B144" }}
                className="text-2xl sm:text-4xl font-bold text-center"
              >
                New Flashcard
              </FancyText>
            </div>
            <textarea
              className="w-full p-3 my-4 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => setIsAddPopupOpen(false)} className="px-4 py-2 text-md text-gray-500 rounded-lg hover:text-gray-600">
                Cancel
              </button>
              <button onClick={handleAddPopupSubmit} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                <div className="px-4 py-2 relative bg-white rounded-full group transition duration-200 text-md text-gray-600 hover:bg-transparent hover:text-white">
                  <span>Save Changes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for editing an existing flashcard */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-center">
              <FancyText
                gradient={{ from: "#FE7EF4", to: "#F6B144" }}
                className="text-2xl sm:text-4xl font-bold text-center"
              >
                Edit Flashcard
              </FancyText>
            </div>
            <textarea
              className="w-full p-3 my-4 border text-md rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <textarea
              className="w-full p-3 border rounded text-md font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit answer..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            />
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => setIsEditPopupOpen(false)} className="px-4 py-2 text-md text-gray-500 rounded-lg hover:text-gray-600">
                Cancel
              </button>
              <button onClick={handleEditPopupSubmit} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                <div className="px-4 py-2 relative bg-white rounded-full group transition duration-200 text-md text-gray-600 hover:bg-transparent hover:text-white">
                  <span>Save Changes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;