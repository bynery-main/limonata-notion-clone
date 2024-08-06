"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, app } from "@/firebase/firebaseConfig";
import { getFunctions, httpsCallable } from "firebase/functions";

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

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notes, setNotes] = useState<NoteReference[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams(); // Use useParams to get dynamic segments

  if (!params) {
    return <p>Invalid workspace or quiz.</p>;
  }

  const workspaceId = params.workspaceId as string;
  const quizId = params.quizId as string;

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
      setAnswers(new Array(fetchedQuizzes.length).fill("")); // Initialize answers array with empty strings

      // Fetch the notes associated with the quiz
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
    const quizEvalAgent = httpsCallable(functions, "quizEvalAgent");

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
      console.log("Quiz evaluation response:", result.data);
    } catch (error) {
      console.error("Error during quiz evaluation:", error);
    } finally {
      setLoading(false);
    }
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
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Answers"}
          </button>
        </div>
      ) : (
        <p>No quizzes available.</p>
      )}
    </div>
  );
};

export default QuizzesPage;
