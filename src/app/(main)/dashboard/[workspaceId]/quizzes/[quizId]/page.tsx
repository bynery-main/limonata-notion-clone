"use client";

import React, { useEffect, useState, ChangeEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, app } from "@/firebase/firebaseConfig";
import { getFunctions, httpsCallable } from "firebase/functions";
import EvaluationComponent from "@/components/ai-tools/evaluation-component";
import { CalendarIcon, CheckIcon, Trash2, Pencil, PlusCircle } from "lucide-react";
import styled, { keyframes } from "styled-components";
import { Button } from "@/components/ui/button";

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

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const AnimatedButton = styled(Button)`
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  border: none;
  color: white;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const AutoResizingTextArea: React.FC<AutoResizingTextAreaProps> = ({
  value,
  onChange,
  placeholder,
  index,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };
    adjustHeight();
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(index, e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full mt-2 mb-4 p-3 border rounded font-light overflow-hidden shadow-inner focus:outline-2 focus:ring-2 focus:ring-black focus:border-black"
      style={{
        minHeight: "100px",
        boxShadow: "inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)",
        resize: "none",
      }}
    />
  );
};

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notes, setNotes] = useState<NoteReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [currentEditQuizId, setCurrentEditQuizId] = useState<string | null>(null);
  const [evaluationCollections, setEvaluationCollections] = useState<Evaluation[][]>([]);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();

  const workspaceId = params?.workspaceId as string;
  const quizId = params?.quizId as string;

  useEffect(() => {
    if (!workspaceId || !quizId) return;

    const fetchQuizzesAndNotes = async () => {
      const quizzesCollectionRef = collection(
        db,
        "workspaces",
        workspaceId,
        "quizSets",
        quizId,
        "quizzes"
      );
      const quizzesSnapshot = await getDocs(quizzesCollectionRef);

      const fetchedQuizzes: Quiz[] = quizzesSnapshot.docs.map((doc) => ({
        id: doc.id,
        question: doc.data().question,
      }));

      console.log("Fetched quizzes:", fetchedQuizzes);
      setQuizzes(fetchedQuizzes);
      setAnswers(new Array(fetchedQuizzes.length).fill(""));

      const quizSetRef = doc(db, "workspaces", workspaceId, "quizSets", quizId);
      const quizSetSnapshot = await getDoc(quizSetRef);

      if (quizSetSnapshot.exists()) {
        const quizSetData = quizSetSnapshot.data();
        setNotes(quizSetData.notes || []);
      } else {
        console.error("Quiz set not found!");
      }
    };

    fetchQuizzesAndNotes();
  }, [workspaceId, quizId]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleUpdateQuiz = async (index: number) => {
    const currentQuestion = quizzes[index].question;
    console.log(`Edit button clicked for quiz ID: ${quizzes[index].id}, Current Question: ${currentQuestion}`);
    setCurrentEditQuizId(quizzes[index].id || null);
    setNewQuestion(currentQuestion);
    setIsEditPopupOpen(true);
  };

  const handleEditPopupSubmit = async () => {
    console.log(`Submit button clicked for editing quiz ID: ${currentEditQuizId}, New Question: ${newQuestion}`);
    if (currentEditQuizId && newQuestion) {
      try {
        const quizDocRef = doc(db, "workspaces", workspaceId, "quizSets", quizId, "quizzes", currentEditQuizId);
        console.log(`Updating Firestore document for quiz ID: ${currentEditQuizId} with new question: ${newQuestion}`);
        await updateDoc(quizDocRef, { question: newQuestion });

        setQuizzes(quizzes.map(quiz => quiz.id === currentEditQuizId ? { ...quiz, question: newQuestion } : quiz));
        setNewQuestion("");
        setIsEditPopupOpen(false);
      } catch (error) {
        console.error("Error updating question:", error);
      }
    }
  };

  const handleDeleteQuiz = async (index: number) => {
    const deletedQuiz = quizzes[index];
    console.log(`Delete button clicked for quiz ID: ${deletedQuiz.id}`);

    if (deletedQuiz.id) {
      const quizDocRef = doc(db, "workspaces", workspaceId, "quizSets", quizId, "quizzes", deletedQuiz.id);
      await deleteDoc(quizDocRef);
    }

    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  const handleAddQuiz = () => {
    console.log("Add button clicked");
    setIsAddPopupOpen(true);
  };

  const handlePopupSubmit = async () => {
    if (newQuestion) {
      try {
        const quizzesCollectionRef = collection(db, "workspaces", workspaceId, "quizSets", quizId, "quizzes");
        const quizDocRef = await addDoc(quizzesCollectionRef, { question: newQuestion });
        
        setQuizzes([...quizzes, { id: quizDocRef.id, question: newQuestion }]);
        setNewQuestion("");
        setIsAddPopupOpen(false);
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const functions = getFunctions(app);
    const quizEvalAgent = httpsCallable<
      { workspaceId: string; notes: NoteReference[]; qa: QA[] },
      QuizEvalResult
    >(functions, "quizEvalAgent");

    const qa: QA[] = quizzes.map((quiz, index) => ({
      question: quiz.question,
      answer: answers[index],
    }));

    try {
      const payload = {
        workspaceId,
        notes,
        qa,
      };
      console.log("Payload being passed to quizEvalAgent:", payload);
      const result = await quizEvalAgent(payload);

      console.log("Raw evaluation data received:", result.data);

      const evalResults = result.data.evaluations;

      const parsedEvaluations = evalResults.map(parseEvaluation);
      setEvaluationCollections([parsedEvaluations, ...evaluationCollections]);
      setSelectedCollectionIndex(0);

      const evaluationCollectionRef = collection(
        db,
        "workspaces",
        workspaceId,
        "quizSets",
        quizId,
        "evaluationCollections"
      );
      const evaluationCollectionDocRef = await addDoc(
        evaluationCollectionRef,
        {}
      );

      const evaluationsCollectionRef = collection(
        evaluationCollectionDocRef,
        "evaluations"
      );
      for (const evaluation of parsedEvaluations) {
        await addDoc(evaluationsCollectionRef, evaluation);
      }

      console.log("Quiz evaluation response:", result.data);
    } catch (error) {
      console.error("Error during quiz evaluation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationHistoryClick = async () => {
    setLoading(true);
    try {
      const evaluationCollectionsRef = collection(
        db,
        "workspaces",
        workspaceId,
        "quizSets",
        quizId,
        "evaluationCollections"
      );
      const evaluationCollectionsSnapshot = await getDocs(
        evaluationCollectionsRef
      );

      const collectionsData = await Promise.all(
        evaluationCollectionsSnapshot.docs.map(async (collectionDoc) => {
          const evaluationsRef = collection(collectionDoc.ref, "evaluations");
          const evaluationsSnapshot = await getDocs(evaluationsRef);
          return evaluationsSnapshot.docs.map(
            (doc) => doc.data() as Evaluation
          );
        })
      );

      setEvaluationCollections(collectionsData);
      setSelectedCollectionIndex(0);
    } catch (error) {
      console.error("Error fetching evaluation history:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseEvaluation = (evaluationString: string): Evaluation => {
    const questionMatch = evaluationString.match(/Question: (.*?)\n/);
    const answerMatch = evaluationString.match(/Answer: (.*?)\n/);
    const scoreMatch = evaluationString.match(/Score: (.*?)\n/);
    const explanationMatch = evaluationString.match(
      /Explanation: (.*?)\nMissed Points:/
    );
    const missedPointsMatch = evaluationString.match(
      /Missed Points: ([\s\S]+?)\nModel Answer:/
    );
    const modelAnswerMatch = evaluationString.match(/Model Answer: ([\s\S]+)/);

    return {
      question: questionMatch ? questionMatch[1].trim() : "",
      answer: answerMatch ? answerMatch[1].trim() : "",
      score: scoreMatch ? scoreMatch[1].trim() : "",
      explanation: explanationMatch ? explanationMatch[1].trim() : "",
      missedPoints: missedPointsMatch ? missedPointsMatch[1].trim() : "",
      modelAnswer: modelAnswerMatch ? modelAnswerMatch[1].trim() : "",
    };
  };

  const calculateTotalScore = (evaluations: Evaluation[]): number => {
    return evaluations.reduce(
      (sum, evaluation) => sum + parseFloat(evaluation.score),
      0
    );
  };

  const totalScores = evaluationCollections.map(calculateTotalScore);
  const reversedTotalScores = totalScores.reverse();

  if (!workspaceId || !quizId) {
    return <p>Invalid workspace or quiz.</p>;
  }

  return (
    <div
      className="m-10"
      style={{
        fontFamily: "Inter, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {quizzes.length > 0 ? (
        <div>
          {quizzes.map((quiz, index) => (
            <div key={index} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {quiz.question}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleUpdateQuiz(index)}
                    className="text-gray-600"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={handleAddQuiz} className="text-blue-500">
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
              </h2>
              <AutoResizingTextArea
                value={answers[index]}
                onChange={handleAnswerChange}
                placeholder="Type your answer here"
                index={index}
              />
            </div>
          ))}
          <div className="flex gap-4 items-center justify-center font-bold">
            <AnimatedButton
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                "Submitting..."
              ) : (
                <div className="flex items-center">
                  <CheckIcon className="mr-2" />
                  Submit Answers
                </div>
              )}
            </AnimatedButton>
            <button
              onClick={handleEvaluationHistoryClick}
              className="px-4 py-2 bg-transparent text-sm text-gray outline rounded-xl hover:bg-gray-400 hover:text-white transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                "Loading..."
              ) : (
                <div className="flex items-center">
                  <CalendarIcon className="mr-2" />
                  Evaluation History
                </div>
              )}
            </button>
          </div>
          {evaluationCollections.length > 0 &&
            selectedCollectionIndex !== null && (
              <EvaluationComponent
                evaluations={evaluationCollections[selectedCollectionIndex]}
                onPrevious={() =>
                  setSelectedCollectionIndex(
                    Math.max(0, selectedCollectionIndex - 1)
                  )
                }
                onNext={() =>
                  setSelectedCollectionIndex(
                    Math.min(
                      evaluationCollections.length - 1,
                      selectedCollectionIndex + 1
                    )
                  )
                }
                hasPrevious={selectedCollectionIndex > 0}
                hasNext={
                  selectedCollectionIndex < evaluationCollections.length - 1
                }
                onSelectCollection={(index: number) =>
                  setSelectedCollectionIndex(index)
                }
                selectedCollectionIndex={selectedCollectionIndex}
                totalCollections={evaluationCollections.length}
                totalScores={reversedTotalScores}
              />
            )}
        </div>
      ) : (
        <p>No quizzes available.</p>
      )}

      {/* Popup for adding new question */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">New Question</h2>
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsAddPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePopupSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for editing existing question */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-11/12 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
            <textarea
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsEditPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPopupSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
