"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchFlashcardDecks, FlashcardDeck } from "@/lib/utils";
import Flashcards from "@/components/ai-tools/flashcards";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useParams } from 'next/navigation';

interface Flashcard {
  question: string;
  answer: string;
}

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const router = useRouter();
  const params = useParams(); // Use useParams to get dynamic segments

  const workspaceId = params?.workspaceId as string;
  const deckId = params?.deckId as string;

  useEffect(() => {
    if (!workspaceId || !deckId) return;

    const fetchData = async () => {
      const fetchedDecks = await fetchFlashcardDecks(workspaceId);
      setDecks(fetchedDecks);

      // Fetch flashcards for the specific deck
      const flashcardsCollectionRef = collection(db, "workspaces", workspaceId, "flashcardsDecks", deckId, "flashcards");
      const flashcardsSnapshot = await getDocs(flashcardsCollectionRef);

      const fetchedFlashcards: Flashcard[] = flashcardsSnapshot.docs.map((doc) => ({
        question: doc.data().question,
        answer: doc.data().answer,
      }));

      console.log("Fetched flashcards:", fetchedFlashcards);
      setFlashcards(fetchedFlashcards);
    };

    fetchData();
  }, [workspaceId, deckId]);

  if (!params) {
    return <p>Invalid workspace or flashcard deck.</p>;
  }

  if (!workspaceId || !deckId) {
    return <p>Invalid workspace or flashcard deck.</p>;
  }

  return (
    <div>
      <h1>Flashcards</h1>
      {flashcards.length > 0 ? (
        <Flashcards flashcards={flashcards} />
      ) : (
        <p>No flashcards available.</p>
      )}
    </div>
  );
};

export default FlashcardsPage;
