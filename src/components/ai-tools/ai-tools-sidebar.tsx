"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Summarise from "./summarise";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Lightbulb, 
  Zap,
  BrainCircuit,
  Brain
} from "lucide-react";
import { FaMicrophone } from "react-icons/fa";
import { IconMicrophone } from "@tabler/icons-react";

interface AIToolsSidebarProps {
  refString: string;
  type: "note" | "file";
  userId: string;
}

const AIToolsSidebar: React.FC<AIToolsSidebarProps> = ({ refString, type, userId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const betaTools = [
    { 
      name: "Find other notes", 
      icon: <BookOpen className="w-5 h-5" />, 
      description: "Find other notes that are similar to this one" 
    },
    {
        name: "Record", 
        icon: <IconMicrophone className="w-5 h-5" />, 
        description: "Record and transcribe your class" 
    },
    { 
      name: "Extract", 
      icon: <FileText className="w-5 h-5" />, 
      description: "Extract key information" 
    },
    { 
      name: "Ideas", 
      icon: <Lightbulb className="w-5 h-5" />, 
      description: "Generate creative ideas based on your content" 
    },
    { 
      name: "Co-Writer", 
      icon: <Zap className="w-5 h-5" />, 
      description: "An AI that writes with you" 
    }
  ];

  return (
    <div 
      className={`h-full backdrop-blur-sm bg-white/60 dark:bg-background/70 border-l border-gray-200/50 dark:border-gray-800/50 shadow-md flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'w-[300px]' : 'w-[60px]'}`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200/50 dark:border-gray-800/50">
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span className="font-bold font-urbanist bg-clip-text text-transparent bg-gradient-to-r to-indigo-500 from-purple-500">AI Tools</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-auto text-gray-600 dark:text-gray-300"
        >
          {isExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 font-urbanist">
        {isExpanded ? (
          <div className="space-y-4">
            <div className="p-2">
              <Summarise refString={refString} type={type} userId={userId} />
            </div>

            <div className="space-y-2 mt-6">
              <div className="px-2 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                Coming Soon
              </div>
              {betaTools.map((tool, index) => (
                <div
                  key={index}
                  className="relative p-2 rounded-lg cursor-not-allowed"
                >
                  <div className="absolute inset-0 rounded-lg"></div>
                  <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center space-x-3 relative">
                    <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full text-purple-500 dark:text-purple-400">
                      {tool.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{tool.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-purple-500">
              <Sparkles className="w-5 h-5" />
            </div>
            {betaTools.map((tool, index) => (
              <div
                key={index}
                className="relative p-2 rounded-full cursor-not-allowed"
              >
                <div className="absolute inset-0 rounded-full backdrop-blur-[2px]"></div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full relative text-gray-400 dark:text-gray-500">
                  {tool.icon}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIToolsSidebar; 