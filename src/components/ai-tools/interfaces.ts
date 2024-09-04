interface Flashcard {
  question: string;
  answer: string;
}

interface Evaluation {
  question: string;
  answer: string;
  explanation: string;
  missedPoints: string;
  modelAnswer: string;
  score: string;
}

interface Quiz {
  id?: string;
  question: string;
}

interface StudyGuide {
  name: string;
  content: string;
}

// general

interface NameGenerationResult {
  success: boolean;
  answer: string;
}

interface CreditUsageResult {
  success: boolean;
  message: string;
  remainingCredits: number;
}

interface NoteReference {
  folderId: string;
  noteId: string;
  type: "note" | "file"; // Indicate whether it's a note or file
}
