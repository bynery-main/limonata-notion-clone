"use client";

import React, { useEffect, useState, useRef } from "react";
import { collection, doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { BookIcon, ChevronRightIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="space-y-2">
        <div
          className={`border rounded-lg ${dropdownVisible ? 'shadow-xl border-2' : ''}`}
        >
          <div
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between cursor-pointer"
            onClick={() => setOpenAccordion(!openAccordion)}
          >
            <div className="flex items-center">
              <BookIcon className="h-4 w-4 mr-2" />
              <span>Study Guides</span>
            </div>
            <ChevronRightIcon 
              className="h-4 w-4 transition-transform duration-300" 
              style={{ transform: openAccordion ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </div>
          
          <AnimatePresence initial={false} mode="wait">
            {openAccordion && (
              <motion.div 
                className="pl-4 overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.3,
                  exit: { duration: 0.3 }
                }}
              >
                {studyGuides.length === 0 ? (
                  <motion.div 
                    className="p-2 text-sm font-light text-gray-500"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    Create your first Study Guide by pressing the
                    <img
                      src="/favicon.ico"
                      alt="LemonGPT"
                      className="inline-block mx-1 w-4 h-4"
                    />                                
                    on the <b className="font-bold">bottom right</b>!
                  </motion.div>
                ) : (
                  studyGuides.map((studyGuide, index) => (
                    <motion.div
                      key={studyGuide.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: index * 0.05,
                        exit: { duration: 0.2, delay: 0 }
                      }}
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
                            className="absolute top-0 right-full mr-2 w-48 bg-white border rounded-lg shadow-lg z-10"
                          >
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRenameStudyGuide();
                              }}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <div className="flex items-center">
                                <PencilIcon className="h-3.5 w-3.5 mr-2"/> Rename 
                              </div>
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteStudyGuide();
                              }}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <div className="flex items-center">
                                <TrashIcon className="h-3.5 w-3.5 mr-2"/> Delete
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudyGuideDropdown;
