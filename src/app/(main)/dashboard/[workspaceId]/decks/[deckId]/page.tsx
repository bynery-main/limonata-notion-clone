"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchFlashcardDecks, FlashcardDeck } from "@/lib/utils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
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
  label: string;
  showTextToSpeech?: boolean;
}

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
        timerDuration: 10, // Default value, adjust as needed
        front: doc.data().question,
        back: doc.data().answer,
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

  if (!workspaceId || !deckId) {
    return <p>Invalid workspace or flashcard deck.</p>;
  }

  return (
    <div className="flex flex-col items-center h-full w-full
    ">
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
        </div>
      ) : (
        <p>No flashcards available.</p>
      )}
    </div>
  );
};

export default FlashcardsPage;