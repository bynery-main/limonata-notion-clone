import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

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
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
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

  const handleDropdownToggle = (event: React.MouseEvent, quizSet: QuizSet) => {
    event.stopPropagation(); // Prevent the click from bubbling up
    setSelectedQuizSet(quizSet);
    setDropdownVisible(!dropdownVisible);
  };

  const handleRenameQuiz = async () => {
    const newName = prompt("Enter a new name for this quiz set:", selectedQuizSet?.name);
    if (newName && selectedQuizSet) {
      const quizSetRef = doc(db, "workspaces", workspaceId, "quizSets", selectedQuizSet.id);
      await updateDoc(quizSetRef, { name: newName });
    }
    setDropdownVisible(false);
  };

  const handleDeleteQuiz = async () => {
    if (selectedQuizSet) {
      const confirmDelete = confirm(`Are you sure you want to delete ${selectedQuizSet.name}?`);
      if (confirmDelete) {
        const quizSetRef = doc(db, "workspaces", workspaceId, "quizSets", selectedQuizSet.id);
        await deleteDoc(quizSetRef);
      }
    }
    setDropdownVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

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
            onClick={() => setOpenAccordion(!openAccordion)}
          >
            <span>Quizzes</span>
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
                <MoreHorizontalIcon
                  className="h-4 w-4 cursor-pointer"
                  onClick={(event) => handleDropdownToggle(event, quizSet)}
                />
                {dropdownVisible && selectedQuizSet?.id === quizSet.id && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                    <button
                      onClick={handleRenameQuiz}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Rename
                    </button>
                    <button
                      onClick={handleDeleteQuiz}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default QuizzesDropdown;
