import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";

interface QuizSet {
  id: string;
  name: string;
}

interface QuizzesDropdownProps {
  workspaceId: string;
  currentQuizSetId: string | null;
  onQuizSetSelect: (quizSet: QuizSet) => void;
  icon?: React.ReactNode;
}

const QuizzesDropdown: React.FC<QuizzesDropdownProps> = ({
  workspaceId,
  currentQuizSetId,
  onQuizSetSelect,
  icon = <PencilIcon className="h-4 w-4 mr-2" />,
}) => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleDropdownToggle = (event: React.MouseEvent, quizSetId: string) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === quizSetId ? null : quizSetId);
  };

  const handleRenameQuiz = async (quizSet: QuizSet) => {
    const newName = prompt("Enter a new name for this quiz set:", quizSet.name);
    if (newName && newName !== quizSet.name) {
      const quizSetRef = doc(db, "workspaces", workspaceId, "quizSets", quizSet.id);
      await updateDoc(quizSetRef, { name: newName });
    }
    setActiveDropdown(null);
  };

  const handleDeleteQuiz = async (quizSet: QuizSet) => {
    const confirmDelete = confirm(`Are you sure you want to delete ${quizSet.name}?`);
    if (confirmDelete) {
      const quizSetRef = doc(db, "workspaces", workspaceId, "quizSets", quizSet.id);
      await deleteDoc(quizSetRef);
    }
    setActiveDropdown(null);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          className="border rounded-lg"
        >
          <Accordion.Trigger
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
            onClick={() => setOpenAccordion(!openAccordion)}
          >
            <div className="flex items-center">
              {icon}
              <span>Quizzes</span>
            </div>
            {openAccordion ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Accordion.Trigger>
          <Accordion.Content
            className={`pl-4 ${openAccordion ? 'block' : 'hidden'}`}
          >
            {quizSets.map((quizSet) => (
              <div
                key={quizSet.id}
                className={`p-2 text-sm w-full text-left flex items-center justify-between cursor-pointer ${quizSet.id === currentQuizSetId ? 'bg-gray-100' : ''}`}
                onClick={() => onQuizSetSelect(quizSet)}
              >
                <span>{quizSet.name}</span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="p-2 rounded-full"
                    onClick={(event) => handleDropdownToggle(event, quizSet.id)}
                  >
                    <MoreHorizontalIcon className="h-5 w-5" />
                  </button>
                  {activeDropdown === quizSet.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleRenameQuiz(quizSet)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <div className="flex items-center">
                          <PencilIcon className="h-3.5 w-3.5 mr-2"/> Rename
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quizSet)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <div className="flex items-center">
                          <TrashIcon className="h-3.5 w-3.5 mr-2"/> Delete
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default QuizzesDropdown;