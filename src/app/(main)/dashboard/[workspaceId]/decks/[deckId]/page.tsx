"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchFlashcardDecks, FlashcardDeck } from "@/lib/utils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useParams } from 'next/navigation';
import { FlashCardArray } from "react-flashcards";
import { CSSProperties } from 'react';

interface Flashcard {
  [key: string]: any;
  id: number;
  timerDuration: number;
  front: string | React.ReactElement;
  back: string | React.ReactElement;
  isMarkdown?: boolean;
  frontStyle?: CSSProperties;
  backStyle?: CSSProperties;
  currentIndex: number;
  label?: string;
  showTextToSpeech?: boolean;
}

const flashcardStyles = {
  card: {
    front: {
      padding: '20px',
      margin: '20px',
    },
    back: {
      padding: '20px',
      margin: '20px',
    },
  },
};

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const deckId = params?.deckId as string;

  useEffect(() => {
    if (!workspaceId || !deckId) return;

    const fetchData = async () => {
      const fetchedDecks = await fetchFlashcardDecks(workspaceId);
      setDecks(fetchedDecks);

      const flashcardsCollectionRef = collection(db, "workspaces", workspaceId, "flashcardsDecks", deckId, "flashcards");
      const flashcardsSnapshot = await getDocs(flashcardsCollectionRef);
      const fetchedFlashcards: Flashcard[] = flashcardsSnapshot.docs.map((doc, index) => ({
        id: index + 1,
        front: doc.data().question,
        back: doc.data().answer,
        timerDuration: 10, // Set a default value or fetch from your data
        label: `Card ${index + 1}`,
        currentIndex: index,
        isMarkdown: false,
        frontStyle: {},
        backStyle: {},
        showTextToSpeech: false,
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
        <FlashCardArray
          cards={flashcards}
          width="600px"
          height="400px"
          direction="horizontal"
          autoplay={false}
          showCount={true}
          showNextPrevButtons={true}
          style={flashcardStyles}
        />
      ) : (
        <p>No flashcards available.</p>
      )}
    </div>
  );
};

export default FlashcardsPage;