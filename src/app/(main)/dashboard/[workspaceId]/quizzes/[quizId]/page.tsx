"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db, app } from "@/firebase/firebaseConfig";
import { getFunctions, httpsCallable } from "firebase/functions";
import EvaluationComponent from "@/components/ai-tools/evaluation-component";

interface Quiz {
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

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notes, setNotes] = useState<NoteReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showEvaluationHistory, setShowEvaluationHistory] = useState(false);
  const [evaluationCollections, setEvaluationCollections] = useState<any[]>([]);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();

  const workspaceId = params?.workspaceId as string;
  const quizId = params?.quizId as string;

  useEffect(() => {
    if (!workspaceId || !quizId) return;

    const fetchQuizzesAndNotes = async () => {
      const quizzesCollectionRef = collection(db, "workspaces", workspaceId, "quizSets", quizId, "quizzes");
      const quizzesSnapshot = await getDocs(quizzesCollectionRef);

      const fetchedQuizzes: Quiz[] = quizzesSnapshot.docs.map((doc) => ({
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

  const handleSubmit = async () => {
    setLoading(true);
    const functions = getFunctions(app);
    const quizEvalAgent = httpsCallable<{ workspaceId: string; notes: NoteReference[]; qa: QA[] }, QuizEvalResult>(
      functions,
      "quizEvalAgent"
    );

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
      const evalResults = result.data.evaluations;

      const parsedEvaluations = evalResults.map(parseEvaluation);
      setEvaluations(parsedEvaluations);

      // Create an evaluation collection document
      const evaluationCollectionRef = collection(
        db,
        "workspaces",
        workspaceId,
        "quizSets",
        quizId,
        "evaluationCollections"
      );
      const evaluationCollectionDocRef = await addDoc(evaluationCollectionRef, {});

      // Store each evaluation as a separate document under the created evaluation collection
      const evaluationsCollectionRef = collection(evaluationCollectionDocRef, "evaluations");
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
      const evaluationCollectionsSnapshot = await getDocs(evaluationCollectionsRef);

      const collectionsData = await Promise.all(
        evaluationCollectionsSnapshot.docs.map(async (collectionDoc) => {
          const evaluationsRef = collection(collectionDoc.ref, "evaluations");
          const evaluationsSnapshot = await getDocs(evaluationsRef);
          return evaluationsSnapshot.docs.map((doc) => doc.data() as Evaluation);
        })
      );

      setEvaluationCollections(collectionsData);
      setShowEvaluationHistory(true);
      setSelectedCollectionIndex(0); // Start with the first collection
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
    const explanationMatch = evaluationString.match(/Explanation: (.*?)\nMissed Points:/);
    const missedPointsMatch = evaluationString.match(/Missed Points: ([\s\S]+?)\nModel Answer:/);
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

  if (!workspaceId || !quizId) {
    return <p>Invalid workspace or quiz.</p>;
  }

  return (
    <div>
      <h1>Quizzes</h1>
      {quizzes.length > 0 ? (
        <div>
          {quizzes.map((quiz, index) => (
            <div key={index}>
              <h2>{quiz.question}</h2>
              <textarea
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                rows={4}
                className="w-full mt-2 mb-4 p-2 border rounded"
                placeholder="Type your answer here"
              />
            </div>
          ))}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Answers"}
            </button>
            <button
              onClick={handleEvaluationHistoryClick}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              disabled={loading}
            >
              {loading ? "Loading..." : "Evaluation History"}
            </button>
          </div>
          {showEvaluationHistory && selectedCollectionIndex !== null && (
            <EvaluationComponent
              evaluations={evaluationCollections[selectedCollectionIndex]}
              onPrevious={() => setSelectedCollectionIndex(Math.max(0, selectedCollectionIndex - 1))}
              onNext={() => setSelectedCollectionIndex(Math.min(evaluationCollections.length - 1, selectedCollectionIndex + 1))}
              hasPrevious={selectedCollectionIndex > 0}
              hasNext={selectedCollectionIndex < evaluationCollections.length - 1}
            />
          )}
        </div>
      ) : (
        <p>No quizzes available.</p>
      )}
    </div>
  );
};

export default QuizzesPage;
