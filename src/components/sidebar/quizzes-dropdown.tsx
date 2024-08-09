"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

interface QuizSet {
  id: string;
  name: string;
}

interface QuizzesDropdownProps {
  workspaceId: string;
  currentQuizSetId: string | null;
  onQuizSetSelect: (quizSet: QuizSet) => void;
}

const QuizzesDropdown: React.FC<QuizzesDropdownProps> = ({
  workspaceId,
  currentQuizSetId,
  onQuizSetSelect,
}) => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [openQuizSetId, setOpenQuizSetId] = useState<string | null>(null);

  useEffect(() => {
    const quizSetsRef = collection(db, "workspaces", workspaceId, "quizSets");

    const unsubscribe = onSnapshot(quizSetsRef, (snapshot) => {
      const updatedQuizSets: QuizSet[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Quiz Set",
      }));

      setQuizSets(updatedQuizSets);
    });

    return () => unsubscribe();
  }, [workspaceId]);

  return (
    <div>
      <Accordion.Root
        type="single"
        value={openQuizSetId || undefined}
        onValueChange={(value) => setOpenQuizSetId(value)}
        className="space-y-2"
      >
        {quizSets.map((quizSet) => (
          <Accordion.Item
            key={quizSet.id}
            value={quizSet.id}
            className={`border rounded-lg shadow-lg ${quizSet.id === currentQuizSetId ? 'bg-gray-100' : ''}`}
          >
            <Accordion.Trigger
              className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
              onClick={() => {
                onQuizSetSelect(quizSet);
              }}
            >
              <span>{quizSet.name}</span>
              {quizSet.id === openQuizSetId ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Accordion.Trigger>
            <Accordion.Content>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
};

export default QuizzesDropdown;
