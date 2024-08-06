"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

const StudyGuidePage = () => {
  const [studyGuide, setStudyGuide] = useState<{ content: string } | null>(null);
  const router = useRouter();
  const params = useParams(); // Use useParams to get dynamic segments

  if (!params) {
    return <p>Invalid workspace or study guide.</p>;
  }

  const workspaceId = params.workspaceId as string;
  const studyguideId = params.studyguideId as string;

  useEffect(() => {
    if (!workspaceId || !studyguideId) return;

    const fetchStudyGuide = async () => {
      const studyGuideDocRef = doc(db, "workspaces", workspaceId, "studyGuides", studyguideId);
      const studyGuideSnapshot = await getDoc(studyGuideDocRef);

      if (studyGuideSnapshot.exists()) {
        const studyGuideData = studyGuideSnapshot.data();
        setStudyGuide({ content: studyGuideData.content });
      } else {
        console.error("Study guide not found!");
      }
    };

    fetchStudyGuide();
  }, [workspaceId, studyguideId]);

  if (!workspaceId || !studyguideId) {
    return <p>Invalid workspace or study guide.</p>;
  }

  return (
    <div>
      {studyGuide ? (
        <div>
          <h1>Study Guide</h1>
          <p>{studyGuide.content}</p>
        </div>
      ) : (
        <p>Loading study guide...</p>
      )}
    </div>
  );
};

export default StudyGuidePage;
