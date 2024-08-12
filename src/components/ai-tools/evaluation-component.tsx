"use client";

import React, { FC } from "react";
import { Button } from "@/components/ui/button";

interface Evaluation {
  question: string;
  answer: string;
  explanation: string;
  missedPoints: string;
  modelAnswer: string;
  score: string;
}

interface EvaluationComponentProps {
  evaluations: Evaluation[];
  onPrevious: () => void;
  onNext: () => void;
  onSelectCollection: (index: number) => void;
  hasPrevious: boolean;
  hasNext: boolean;
  selectedCollectionIndex: number;
  totalCollections: number;
}

const EvaluationComponent: FC<EvaluationComponentProps> = ({
  evaluations,
  onPrevious,
  onNext,
  onSelectCollection,
  hasPrevious,
  hasNext,
  selectedCollectionIndex,
  totalCollections,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quiz Evaluation</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled={!hasPrevious} onClick={onPrevious}>
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
          <div className="flex gap-1">
            {[...Array(totalCollections)].map((_, index) => (
              <button
                key={index}
                className={`px-2 py-1 rounded-full ${selectedCollectionIndex === index ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                onClick={() => onSelectCollection(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" disabled={!hasNext} onClick={onNext}>
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="bg-background rounded-lg shadow-lg p-6 md:p-8">
        <div className="grid gap-6">
          {evaluations.map((evaluation, index) => (
            <div key={index} className="grid gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{evaluation.question}</h3>
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium">
                  {evaluation.score}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg shadow-lg p-4">
                  <p className="text-muted-foreground">Your Answer:</p>
                  <p className="text-lg font-medium">{evaluation.answer}</p>
                </div>
                <div className="bg-background rounded-lg shadow-lg p-4">
                  <p className="text-muted-foreground">Model Answer:</p>
                  <p className="text-lg font-medium">{evaluation.modelAnswer}</p>
                </div>
              </div>
              <div className="bg-background rounded-lg shadow-lg p-4">
                <p className="text-muted-foreground">Explanation:</p>
                <p>{evaluation.explanation}</p>
              </div>
              <div className="bg-background rounded-lg shadow-lg p-4">
                <p className="text-muted-foreground">Missed Points:</p>
                <p>{evaluation.missedPoints}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default EvaluationComponent;
