interface Quiz {
    id?: string;
    question: string;
  }
  
  interface QA {
    question: string;
    answer: string;
  }
  
  interface NoteReference {
    folderId: string;
    noteId: string;
  }
  
  interface Evaluation {
    question: string;
    answer: string;
    explanation: string;
    missedPoints: string;
    modelAnswer: string;
    score: string;
  }
  
  interface QuizEvalResult {
    evaluations: string[];
  }
  
  interface AutoResizingTextAreaProps {
    value: string;
    onChange: (index: number, value: string) => void;
    placeholder: string;
    index: number;
  }
  
  interface CreditUsageResult {
    success: boolean;
    message: string;
    remainingCredits: number;
  }