import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot, getDocs, query, DocumentReference, CollectionReference } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import exp from "constants";

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
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuIconRef = useRef<HTMLDivElement>(null);

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
    event.stopPropagation();
    setSelectedQuizSet(quizSet);

    const targetRect = (event.target as HTMLElement).getBoundingClientRect();
    setDropdownPosition({ top: targetRect.bottom, left: targetRect.left });
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

  const deleteCollection = async (collectionRef: CollectionReference) => {
    const querySnapshot = await getDocs(query(collectionRef));
    const deleteOps = querySnapshot.docs.map(async (doc) => {
      await deleteDocument(doc.ref);
    });
    await Promise.all(deleteOps);
  };

  const deleteDocument = async (docRef: DocumentReference) => {
    // Delete subcollections
    const subcollections = ['quizzes', 'evaluationCollections', 'evaluations']; // Add all known subcollection names
    for (const subcollectionName of subcollections) {
      const subcollectionRef = collection(docRef, subcollectionName);
      await deleteCollection(subcollectionRef);
    }
    // Delete the document itself
    await deleteDoc(docRef);
  };

  const handleDeleteQuiz = async () => {
    if (selectedQuizSet) {
      const confirmDelete = confirm(`Are you sure you want to delete ${selectedQuizSet.name}?`);
      if (confirmDelete) {
        try {
          const quizSetRef = doc(db, "workspaces", workspaceId, "quizSets", selectedQuizSet.id);
          await deleteDocument(quizSetRef);
          console.log("Quiz set and all nested documents deleted successfully");
        } catch (error) {
          console.error("Error deleting quiz set:", error);
        }
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
          className={`border rounded-lg ${dropdownVisible ? 'shadow-xl border-2' : ''}`}
        >
          <Accordion.Trigger
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
            onClick={() => setOpenAccordion(!openAccordion)}
          >
            <div className="flex items-center">
              <PencilIcon className="h-4 w-4 mr-2" />
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
          {quizSets.length === 0 ? (
              <div className="p-2 text-sm font-light text-gray-500">
                Create your first Quiz by pressing the
                <img
                    src="/favicon.ico"
                    alt="LemonGPT"
                    className="inline-block mx-1 w-4 h-4"
                  />                                
                     on the <b className="font-bold">bottom right</b>!
                     </div>
            ) : (
              quizSets.map((quizSet) => (
                <div
                  key={quizSet.id}
                  className={`p-2 text-sm w-full text-left flex items-center justify-between hover:bg-gray-100 rounded-lg cursor-pointer ${quizSet.id === currentQuizSetId ? 'bg-gray-100' : ''}`}
                  onClick={() => onQuizSetSelect(quizSet)}
                >
                  <span>{quizSet.name}</span>
                  <div className="flex-shrink-0 relative" ref={menuIconRef}>
                    <MoreHorizontalIcon
                      className="h-4 w-4 cursor-pointer"
                      onClick={(event) => handleDropdownToggle(event, quizSet)}
                    />
                    {dropdownVisible && selectedQuizSet?.id === quizSet.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute top-0 right-full mr-2 w-48 bg-white border rounded-lg shadow-lg z-10"
                      >
                        <button
                          onClick={handleRenameQuiz}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <div className="flex items-center">
                            <PencilIcon className="h-3.5 w-3.5 mr-2"/> Rename 
                          </div>
                        </button>
                        <button
                          onClick={handleDeleteQuiz}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <div className="flex items-center">
                            <TrashIcon className="h-3.5 w-3.5 mr-2"/>
                            Delete
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};
export default QuizzesDropdown;