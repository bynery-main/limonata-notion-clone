"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import ReactMarkdown from 'react-markdown';
import { generateStudyGuidePdf } from "@/utils/pdfGenerator";
import Image from 'next/image';
import { DownloadIcon } from "lucide-react";

const StudyGuidePage = () => {
  const [studyGuide, setStudyGuide] = useState<{ content: string; title?: string } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
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
        setStudyGuide({ 
          content: studyGuideData.content,
          title: studyGuideData.title || 'Study Guide'
        });
      } else {
        console.error("Study guide not found!");
      }
    };

    fetchStudyGuide();
  }, [workspaceId, studyguideId]);

  const handleDownloadPdf = () => {
    if (!contentRef.current || !studyGuide) return;
    
    setIsGeneratingPdf(true);
    
    generateStudyGuidePdf(studyGuide)
      .then(() => {
        setIsGeneratingPdf(false);
      })
      .catch(error => {
        console.error("Error generating PDF:", error);
        setIsGeneratingPdf(false);
      });
  };

  if (!workspaceId || !studyguideId) {
    return <p>Invalid workspace or study guide.</p>;
  }

  const markdownStyles = {
    p: 'mb-6 font-light break-words',
    ul: 'mb-6 list-disc pl-6',
    ol: 'mb-6 list-decimal pl-6',
    li: 'mb-3 font-light break-words',
    h1: 'text-4xl font-bold mt-8 mb-6 break-words bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] inline-block text-transparent bg-clip-text',
    h2: 'text-3xl font-bold mt-8 mb-6 break-words bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] inline-block text-transparent bg-clip-text opacity-90',
    h3: 'text-2xl font-bold mt-8 mb-6 break-words bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] inline-block text-transparent bg-clip-text opacity-80',
    h4: 'text-xl font-bold mt-8 mb-6 break-words bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] inline-block text-transparent bg-clip-text opacity-70',
    h5: 'font-bold mt-8 mb-6 break-words bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] inline-block text-transparent bg-clip-text opacity-60',
    h6: 'font-bold mt-8 mb-6 break-words bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] inline-block text-transparent bg-clip-text opacity-50',
    strong: 'font-bold',
    code: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm break-words',
    pre: 'bg-gray-100 rounded p-4 whitespace-pre-wrap',
  };

  const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    p: ({ children }) => <p className={markdownStyles.p}>{children}</p>,
    ul: ({ children }) => <ul className={markdownStyles.ul}>{children}</ul>,
    ol: ({ children }) => <ol className={markdownStyles.ol}>{children}</ol>,
    li: ({ children }) => <li className={markdownStyles.li}>{children}</li>,
    h1: ({ children }) => <h1 className={markdownStyles.h1}>{children}</h1>,
    h2: ({ children }) => <h2 className={markdownStyles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={markdownStyles.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={markdownStyles.h4}>{children}</h4>,
    h5: ({ children }) => <h5 className={markdownStyles.h5}>{children}</h5>,
    h6: ({ children }) => <h6 className={markdownStyles.h6}>{children}</h6>,
    strong: ({ children }) => <strong className={markdownStyles.strong}>{children}</strong>,
    code: (props) => {
      const { inline, className, children } = props as { inline?: boolean; className?: string; children: React.ReactNode };
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <pre className={markdownStyles.pre}>
          <code className={className}>{children}</code>
        </pre>
      ) : (
        <code className={markdownStyles.code}>{children}</code>
      );
    },
  };

  return (
    <div className="container px-4 py-8 relative">
      <div className="absolute inset-0 " />
      {studyGuide ? (
        <div className="relative max-w-full m-12 bg-white/60 backdrop-blur-lg rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.15)] p-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] text-white rounded-lg shadow hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGeneratingPdf ? 'Generating PDF...' : (
                <>
                  <DownloadIcon className="inline mr-2" />
                  Download PDF
                </>
              )}
            </button>
          </div>
          <div ref={contentRef} className="prose dark:prose-invert max-w-none mx-16 py-10">
            <ReactMarkdown components={components}>
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