"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

interface StudyGuide {
  id: string;
  title: string;
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

  useEffect(() => {
    const studyGuidesRef = collection(db, "workspaces", workspaceId, "studyGuides");

    const unsubscribe = onSnapshot(studyGuidesRef, (snapshot) => {
      const updatedStudyGuides: StudyGuide[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Unnamed Study Guide",
      }));

      setStudyGuides(updatedStudyGuides);
    });

    return () => unsubscribe();
  }, [workspaceId]);

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
          className="border rounded-lg shadow-lg"
        >
          <Accordion.Trigger
            className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
          >
            <span>Study Guides</span>
            {openAccordion ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Accordion.Trigger>
          <Accordion.Content>
            <div className="pl-4">
              {studyGuides.map((studyGuide) => (
                <div
                  key={studyGuide.id}
                  className={`p-2 text-sm w-full text-left flex items-center justify-between cursor-pointer ${studyGuide.id === currentStudyGuideId ? 'bg-gray-100' : ''}`}
                  onClick={() => onStudyGuideSelect(studyGuide)}
                >
                  <span>{studyGuide.title}</span>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default StudyGuideDropdown;
