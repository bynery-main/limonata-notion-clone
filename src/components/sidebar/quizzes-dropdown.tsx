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
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);

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
        value={openAccordion ? "quizzes" : undefined}
        onValueChange={(value) => setOpenAccordion(value === "quizzes")}
        className="space-y-2"
      >
        <Accordion.Item
          value="quizzes"
          className="border rounded-lg shadow-lg"
        >
          <Accordion.Trigger
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
          >
            <span>Quizzes</span>
            {openAccordion ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Accordion.Trigger>
          <Accordion.Content>
            <div className="pl-4">
              {quizSets.map((quizSet) => (
                <div
                  key={quizSet.id}
                  className={`p-2 text-sm w-full text-left flex items-center justify-between cursor-pointer ${quizSet.id === currentQuizSetId ? 'bg-gray-100' : ''}`}
                  onClick={() => onQuizSetSelect(quizSet)}
                >
                  <span>{quizSet.name}</span>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default QuizzesDropdown;