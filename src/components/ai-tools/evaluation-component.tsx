"use client";

import React, { FC } from "react";
import { Button } from "@/components/ui/button";
import ScoreTimelineGraph from "./score-timeline-graph";

interface EvaluationComponentProps {
  evaluations: Evaluation[];
  onPrevious: () => void;
  onNext: () => void;
  onSelectCollection: (index: number) => void;
  hasPrevious: boolean;
  hasNext: boolean;
  selectedCollectionIndex: number;
  totalCollections: number;
  totalScores: number[];
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
  totalScores,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Quiz Evaluation
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasPrevious}
            onClick={onPrevious}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
          <div className="flex gap-1">
            {[...Array(totalCollections)].map((_, index) => {
              const reverseIndex = totalCollections - 1 - index;
              return (
                <button
                  key={reverseIndex}
                  className={`px-2 py-1 rounded-full ${
                    selectedCollectionIndex === reverseIndex
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => onSelectCollection(reverseIndex)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasNext}
            onClick={onNext}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="grid gap-8">
          {evaluations.map((evaluation, index) => (
            <div key={index} className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {evaluation.question}
                </h3>
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                  {evaluation.score}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500">Your Answer:</p>
                  <p className="text-lg font-medium text-gray-800">
                    {evaluation.answer}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500">Model Answer:</p>
                  <p className="text-lg font-medium text-gray-800">
                    {evaluation.modelAnswer}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500">Explanation:</p>
                <p className="text-base text-gray-800">
                  {evaluation.explanation}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500">Missed Points:</p>
                <p className="text-base text-gray-800">
                  {evaluation.missedPoints}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Add the ScoreTimelineGraph below the evaluations */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Score Timeline
          </h2>
          <ScoreTimelineGraph scores={totalScores} />
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
