import { CSSProperties } from "react";


export interface Flashcard {
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

