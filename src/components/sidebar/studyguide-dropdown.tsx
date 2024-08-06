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
  const [openStudyGuideId, setOpenStudyGuideId] = useState<string | null>(null);

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
        value={openStudyGuideId || undefined}
        onValueChange={(value) => setOpenStudyGuideId(value)}
        className="space-y-2"
      >
        {studyGuides.map((studyGuide) => (
          <Accordion.Item
            key={studyGuide.id}
            value={studyGuide.id}
            className={`border rounded-lg shadow-lg ${studyGuide.id === currentStudyGuideId ? 'bg-gray-100' : ''}`}
          >
            <Accordion.Trigger
              className="hover:no-underline p-2 text-sm w-full text-left flex items-center justify-between"
              onClick={() => {
                onStudyGuideSelect(studyGuide);
              }}
            >
              <span>{studyGuide.title}</span>
              {studyGuide.id === openStudyGuideId ? (
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

export default StudyGuideDropdown;
