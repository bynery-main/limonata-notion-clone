"use client";

import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { BookIcon, ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";

interface StudyGuide {
  id: string;
  name: string;
}

interface StudyGuideDropdownProps {
  workspaceId: string;
  currentStudyGuideId: string | null;
  onStudyGuideSelect: (studyGuide: StudyGuide) => void;
}

const StudyGuideDropdown: React.FC<StudyGuideDropdownProps> = ({
  workspaceId,
  currentStudyGuideId,
  onStudyGuideSelect,
}) => {
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [selectedStudyGuide, setSelectedStudyGuide] = useState<StudyGuide | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const studyGuidesRef = collection(db, "workspaces", workspaceId, "studyGuides");

    const unsubscribe = onSnapshot(studyGuidesRef, (snapshot) => {
      const updatedStudyGuides: StudyGuide[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Study Guide",
      }));

      setStudyGuides(updatedStudyGuides);
    });

    return () => unsubscribe();
  }, [workspaceId]);

  const handleDropdownToggle = (event: React.MouseEvent, studyGuide: StudyGuide) => {
    event.stopPropagation(); // Prevent the click from bubbling up
    setSelectedStudyGuide(studyGuide);

    const targetRect = (event.target as HTMLElement).getBoundingClientRect();
    setDropdownPosition({ top: targetRect.bottom, left: targetRect.left });
    setDropdownVisible(!dropdownVisible);
  };

  const handleRenameStudyGuide = async () => {
    const newName = prompt("Enter a new name for this study guide:", selectedStudyGuide?.name);
    if (newName && selectedStudyGuide) {
      const studyGuideRef = doc(db, "workspaces", workspaceId, "studyGuides", selectedStudyGuide.id);
      await updateDoc(studyGuideRef, { name: newName });
    }
    setDropdownVisible(false);
  };

  const handleDeleteStudyGuide = async () => {
    if (selectedStudyGuide) {
      const confirmDelete = confirm(`Are you sure you want to delete ${selectedStudyGuide.name}?`);
      if (confirmDelete) {
        const studyGuideRef = doc(db, "workspaces", workspaceId, "studyGuides", selectedStudyGuide.id);
        await deleteDoc(studyGuideRef);
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
        value={openAccordion ? "studyGuides" : undefined}
        onValueChange={(value) => setOpenAccordion(value === "studyGuides")}
        className="space-y-2"
      >
        <Accordion.Item
          value="studyGuides"
          className={`border rounded-lg ${dropdownVisible ? 'shadow-xl border-2' : ''}`}
        >
          <Accordion.Trigger
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
            onClick={() => setOpenAccordion(!openAccordion)}
          >
                        <div className="flex items-center">
                        <BookIcon className="h-4 w-4 mr-2" />
              <span>Study Guides</span>
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
            {studyGuides.length === 0 ? (
              <div className="p-2 text-sm font-light text-gray-500">
                Create your first Study Guide by pressing the
                <img
                    src="/favicon.ico"
                    alt="LemonGPT"
                    className="inline-block mx-1 w-4 h-4"
                  />                                
                     on the <b className="font-bold">bottom right</b>!
                     </div>
            ) : (
              studyGuides.map((studyGuide) => (
                <div
                  key={studyGuide.id}
                  className={`p-2 text-sm w-full text-left flex items-center hover:bg-gray-100 rounded-lg justify-between cursor-pointer ${studyGuide.id === currentStudyGuideId ? 'bg-gray-100' : ''}`}
                  onClick={() => onStudyGuideSelect(studyGuide)}
                >
                  <span>{studyGuide.name}</span>
                  <div className="flex-shrink-0 relative" ref={menuIconRef}>
                    <MoreHorizontalIcon
                      className="h-4 w-4 cursor-pointer"
                      onClick={(event) => handleDropdownToggle(event, studyGuide)}
                    />
                  {dropdownVisible && selectedStudyGuide?.id === studyGuide.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-0 right-full mr-2 w-48 bg-white border rounded-lg shadow-lg z-10"                  >
                      <button
                        onClick={handleRenameStudyGuide}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <div className="flex items-center">
                          <PencilIcon className="h-3.5 w-3.5 mr-2"/> Rename 
                        </div>
                      </button>
                      <button
                        onClick={handleDeleteStudyGuide}
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

              ))
            )}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default StudyGuideDropdown;
