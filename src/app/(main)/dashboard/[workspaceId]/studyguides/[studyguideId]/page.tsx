"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import ReactMarkdown from 'react-markdown';

const StudyGuidePage = () => {
  const [studyGuide, setStudyGuide] = useState<{ content: string } | null>(null);
  const params = useParams();

  const workspaceId = params?.workspaceId as string;
  const studyguideId = params?.studyguideId as string;

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

  const markdownStyles = {
    p: 'mb-6 font-light break-words',
    ul: 'mb-6 list-disc pl-6',
    ol: 'mb-6 list-decimal pl-6',
    li: 'mb-3 font-light break-words',
    h1: 'text-3xl font-bold mt-6 mb-4 break-words',
    h2: 'text-2xl font-bold mt-6 mb-4 break-words',
    h3: 'text-xl font-bold mt-6 mb-4 break-words',
    h4: 'text-lg font-bold mt-6 mb-4 break-words',
    h5: 'font-bold mt-6 mb-4 break-words',
    h6: 'font-bold mt-6 mb-4 break-words',
    strong: 'font-bold',
    code: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm break-words',
    pre: 'bg-gray-100 rounded p-4 whitespace-pre-wrap',
  };

  return (
    <div className="container mx-auto px-4 py-8 font-['Inter',sans-serif]">
      {studyGuide ? (
        <div className="max-w-full m-10">
          <h1 className="text-3xl font-bold mb-6">Study Guide</h1>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                ol: ({node, ...props}) => <ol className={markdownStyles.ol} {...props} />,
                li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                h4: ({node, ...props}) => <h4 className={markdownStyles.h4} {...props} />,
                h5: ({node, ...props}) => <h5 className={markdownStyles.h5} {...props} />,
                h6: ({node, ...props}) => <h6 className={markdownStyles.h6} {...props} />,
                strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? <code className={markdownStyles.code} {...props} /> : <pre className={markdownStyles.pre}><code {...props} /></pre>,
              }}
            >
              {studyGuide.content}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <p>Loading study guide...</p>
      )}
    </div>
  );
};

export default StudyGuidePage;