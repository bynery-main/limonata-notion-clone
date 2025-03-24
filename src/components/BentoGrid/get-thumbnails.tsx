import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface FileThumbnailProps {
  fileName: string;
  fileUrl?: string;
  className?: string;
  type?: string;
}

// Cache to store random values based on file identification
const thumbnailCache = new Map();

// Helper function to generate a unique cache key
const getCacheKey = (fileName: string, type: string | undefined, fileUrl: string | undefined) => {
  return `${fileName}_${type || ''}_${fileUrl || ''}`;
};

const WaveformIcon = () => (
  <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {[...Array(25)].map((_, i) => {
      const height = Math.random() * 58 + 2;
      return (
        <rect
          key={i}
          x={i * 4}
          y={(60 - height) / 2}
          width="2"
          height={height}
          fill="#FC608D"
          opacity="0.6"
        />
      );
    })}
  </svg>
);

const TextSkeleton = () => (
  <div className="space-y-4 w-full p-4">
    <div className="h-2 bg-gray-300 rounded w-3/4"></div>
    <div className="h-2 bg-gray-300 rounded w-full"></div>
    <div className="h-2 bg-gray-300 rounded w-5/6"></div>
    <div className="h-2 bg-gray-300 rounded w-4/5"></div>
    <div className="h-2 bg-gray-300 rounded w-2/3"></div>
  </div>
);

// New components for specialized thumbnails with multiple gradient options
const FlashcardThumbnail = () => {
  // Array of gradient options for flashcards
  const gradients = [
    "bg-gradient-to-br from-[#F6B144] to-[#FE7EF4]",
    "bg-gradient-to-br from-[#FF9966] to-[#FF5E62]",
    "bg-gradient-to-br from-[#FFCC33] to-[#FF6B6B]",
    "bg-gradient-to-br from-[#FFD700] to-[#FFA07A]",
    "bg-gradient-to-br from-[#FFA500] to-[#FF4500]",
    "bg-gradient-to-br from-[#FF8C00] to-[#FF1493]",
    "bg-gradient-to-br from-[#FFB347] to-[#FFCC33]",
    "bg-gradient-to-br from-[#FF7F50] to-[#FF69B4]"
  ];
  
  // Select a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  // Random rotation for cards
  const rotation1 = Math.floor(Math.random() * 6) + 1;
  const rotation2 = -Math.floor(Math.random() * 6) - 1;
  
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center transform rotate-${rotation1} border border-white/30`}>
            <div className="w-full p-3 text-white text-center">
              <div className="h-2 bg-white/60 rounded w-3/4 mx-auto mb-3"></div>
              <div className="h-2 bg-white/60 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          <div className={`w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center transform rotate-${rotation2} absolute border border-white/30`}>
            <div className="w-full p-3 text-white text-center">
              <div className="h-2 bg-white/60 rounded w-3/4 mx-auto mb-3"></div>
              <div className="h-2 bg-white/60 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizThumbnail = () => {
  // Array of gradient options for quizzes
  const gradients = [
    "bg-gradient-to-br from-[#C66EC5] to-[#FC608D]",
    "bg-gradient-to-br from-[#7F00FF] to-[#E100FF]",
    "bg-gradient-to-br from-[#9D50BB] to-[#6E48AA]",
    "bg-gradient-to-br from-[#8A2387] to-[#E94057]",
    "bg-gradient-to-br from-[#DA22FF] to-[#9733EE]",
    "bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0]",
    "bg-gradient-to-br from-[#B621FE] to-[#1FD1F9]",
    "bg-gradient-to-br from-[#6A11CB] to-[#2575FC]"
  ];
  
  // Select a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  // Random number of quiz items (2-4)
  const numItems = Math.floor(Math.random() * 3) + 2;
  
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center border border-white/30">
          <div className="w-full p-3 text-white">
            {[...Array(numItems)].map((_, i) => (
              <div key={i} className="flex items-center mb-3">
                <div className="h-4 w-4 rounded-full bg-white/60 mr-2"></div>
                <div className="h-2 bg-white/60 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyGuideThumbnail = () => {
  // Array of gradient options for study guides (avoiding light greens)
  const gradients = [
    "bg-gradient-to-br from-[#4F86F7] to-[#48D1CC]",
    "bg-gradient-to-br from-[#0093E9] to-[#80D0C7]",
    "bg-gradient-to-br from-[#00B4DB] to-[#0083B0]",
    "bg-gradient-to-br from-[#56CCF2] to-[#2F80ED]",
    "bg-gradient-to-br from-[#2193b0] to-[#6dd5ed]",
    "bg-gradient-to-br from-[#36D1DC] to-[#5B86E5]",
    "bg-gradient-to-br from-[#1A2980] to-[#26D0CE]",
    "bg-gradient-to-br from-[#0575E6] to-[#4A00E0]"  // Replaced green with deep blue/purple
  ];
  
  // Select a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  // Random number of lines (2-3)
  const numLines = Math.floor(Math.random() * 2) + 2;
  
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center border border-white/30">
          <div className="w-full p-3 text-white">
            <div className="h-3 bg-white/60 rounded w-1/2 mb-3"></div>
            <div className="space-y-2">
              {[...Array(numLines)].map((_, i) => (
                <div key={i} className="h-2 bg-white/60 rounded" style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}></div>
              ))}
            </div>
            <div className="h-3 bg-white/60 rounded w-1/3 mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 

// Enhanced TextSkeleton for notes
const NoteThumbnail = () => {
  // Array of gradient options for notes with better contrast (no light yellows/greens)
  const gradients = [
    "bg-gradient-to-br from-[#A9F1DF] to-[#FFBBEC]",
    "bg-gradient-to-br from-[#E2B0FF] to-[#9F44D3]",
    "bg-gradient-to-br from-[#F5F7FA] to-[#C3CFE2]",
    "bg-gradient-to-br from-[#E0EAFC] to-[#CFDEF3]",
    "bg-gradient-to-br from-[#E6DADA] to-[#274046]",
    "bg-gradient-to-br from-[#74EBD5] to-[#9FACE6]",
    "bg-gradient-to-br from-[#FFFEFF] to-[#D7FFFE]",
    "bg-gradient-to-br from-[#E6E9F0] to-[#9733EE]"  // Replaced yellow with purple
  ];
  
  // Select a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  // Random number of lines (3-5)
  const numLines = Math.floor(Math.random() * 3) + 3;
  
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-5">
          <div className="h-4 bg-white/70 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(numLines)].map((_, i) => (
              <div key={i} className="h-2 bg-white/70 rounded" style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}></div>
            ))}
          </div>
          <div className="mt-auto pt-4 flex items-center">
            <div className="h-3 w-3 rounded-full bg-white/70 mr-2"></div>
            <div className="h-2 bg-white/70 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// New component for collaborative study notes
const CollaborativeNoteThumbnail = () => {
  // Array of gradient options for collaborative notes
  const gradients = [
    "bg-gradient-to-br from-[#A9F1DF] to-[#FFBBEC]",
    "bg-gradient-to-br from-[#E2B0FF] to-[#9F44D3]",
    "bg-gradient-to-br from-[#F5F7FA] to-[#C3CFE2]",
    "bg-gradient-to-br from-[#E0EAFC] to-[#CFDEF3]",
    "bg-gradient-to-br from-[#E6DADA] to-[#274046]",
    "bg-gradient-to-br from-[#74EBD5] to-[#9FACE6]",
    "bg-gradient-to-br from-[#FFFEFF] to-[#D7FFFE]",
    "bg-gradient-to-br from-[#E6E9F0] to-[#9733EE]"
  ];
  
  // Select a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  // Generate random positions for cursors
  const cursor1X = Math.floor(Math.random() * 80); // 0-80% from left
  const cursor1Y = Math.floor(Math.random() * 60); // 0-60% from top
  
  const cursor2X = Math.floor(Math.random() * 80); // 0-80% from left
  const cursor2Y = Math.floor(Math.random() * 60) + 20; // 20-80% from top (avoid overlap)
  
  const cursor3X = Math.floor(Math.random() * 80); // 0-80% from left
  const cursor3Y = Math.floor(Math.random() * 40) + 40; // 40-80% from top (avoid overlap)
  
  // Cursor colors
  const cursorColors = [
    { fill: "#3B82F6", stroke: "#3B82F6" }, // Blue
    { fill: "#EC4899", stroke: "#EC4899" }, // Pink
    { fill: "#8B5CF6", stroke: "#8B5CF6" }  // Purple
  ];
  
  // Shuffle cursor colors
  const shuffledColors = [...cursorColors].sort(() => Math.random() - 0.5);
  
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-5">
          {/* Document with multiple cursors to show collaboration */}
          <div className="h-4 bg-white/70 rounded w-1/2 mb-4"></div>
          <div className="space-y-3 relative">
            <div className="h-2 bg-white/70 rounded w-full"></div>
            <div className="h-2 bg-white/70 rounded w-5/6"></div>
            <div className="h-2 bg-white/70 rounded w-full"></div>
            <div className="h-2 bg-white/70 rounded w-4/5"></div>
            <div className="h-2 bg-white/70 rounded w-3/4"></div>
            
            {/* First cursor - random position */}
            <div className="absolute" style={{ left: `${cursor1X}%`, top: `${cursor1Y}%` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={shuffledColors[0].fill} stroke={shuffledColors[0].stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Second cursor - random position */}
            <div className="absolute" style={{ left: `${cursor2X}%`, top: `${cursor2Y}%` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={shuffledColors[1].fill} stroke={shuffledColors[1].stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Third cursor - random position */}
            <div className="absolute" style={{ left: `${cursor3X}%`, top: `${cursor3Y}%` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={shuffledColors[2].fill} stroke={shuffledColors[2].stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div className="mt-auto pt-4 flex justify-between items-center">
            {/* Collaboration indicators */}
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-400 border-2 border-white"></div>
              <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-white"></div>
              <div className="w-5 h-5 rounded-full bg-purple-400 border-2 border-white"></div>
            </div>
            <div className="h-6 w-6 rounded-sm bg-white/40 flex items-center justify-center">
              <div className="h-3 w-3 rounded-sm bg-white/90"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced TextSkeleton for general files
const EnhancedFileThumbnail = (fileExtension: string) => {
  // Different gradient sets based on file type
  const documentGradients = [
    "bg-gradient-to-br from-[#E0EAFC] to-[#CFDEF3]",
    "bg-gradient-to-br from-[#F5F7FA] to-[#C3CFE2]",
    "bg-gradient-to-br from-[#E6DADA] to-[#274046]",
    "bg-gradient-to-br from-[#A1C4FD] to-[#C2E9FB]"
  ];
  
  const mediaGradients = [
    "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]",
    "bg-gradient-to-br from-[#FFECD2] to-[#FCB69F]",
    "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]",
    "bg-gradient-to-br from-[#A18CD1] to-[#FBC2EB]"
  ];
  
  const audioGradients = [
    "bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC]",
    "bg-gradient-to-br from-[#A6C0FE] to-[#F68084]",
    "bg-gradient-to-br from-[#D4FC79] to-[#96E6A1]",
    "bg-gradient-to-br from-[#85FFBD] to-[#FFFB7D]"
  ];
  
  // Select appropriate gradient set
  let gradientSet = documentGradients;
  if (["jpg", "jpeg", "png", "gif", "webp", "mp4", "avi", "mov", "wmv"].includes(fileExtension)) {
    gradientSet = mediaGradients;
  } else if (["mp3", "wav", "ogg", "flac"].includes(fileExtension)) {
    gradientSet = audioGradients;
  }
  
  // Select a random gradient from the appropriate set
  const randomGradient = gradientSet[Math.floor(Math.random() * gradientSet.length)];
  
  // Document-specific design
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(fileExtension)) {
    return (
      <div className={`w-full h-full ${randomGradient} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-5">
            <div className="h-3 bg-white/70 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-2 bg-white/70 rounded w-full"></div>
              <div className="h-2 bg-white/70 rounded w-5/6"></div>
              <div className="h-2 bg-white/70 rounded w-full"></div>
              <div className="h-2 bg-white/70 rounded w-4/5"></div>
            </div>
            <div className="mt-auto pt-4 flex justify-between items-center">
              <div className="h-2 bg-white/70 rounded w-1/4"></div>
              <div className="h-6 w-6 rounded-sm bg-white/40 flex items-center justify-center">
                <div className="h-3 w-3 rounded-sm bg-white/90"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Image-specific design
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
    return (
      <div className={`w-full h-full ${randomGradient} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/40 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/60"></div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 h-2 bg-white/40 rounded-full">
                <div className="h-full w-2/3 bg-white/80 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Video-specific design
  if (["mp4", "avi", "mov", "wmv"].includes(fileExtension)) {
    return (
      <div className={`w-full h-full ${randomGradient} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/40 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white/80 border-b-8 border-b-transparent ml-1"></div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="h-2 w-2/3 bg-white/40 rounded-full">
                  <div className="h-full w-1/3 bg-white/80 rounded-full"></div>
                </div>
                <div className="text-white/80 text-xs">0:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Presentation-specific design
  if (["ppt", "pptx"].includes(fileExtension)) {
    return (
      <div className={`w-full h-full ${randomGradient} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/40 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-white/20 flex items-center justify-center">
              <div className="h-2 bg-white/70 rounded w-1/2"></div>
            </div>
            <div className="absolute top-1/4 bottom-0 left-0 right-0 p-4 flex flex-col">
              <div className="flex-1 flex items-center">
                <div className="space-y-2 w-full">
                  <div className="h-3 bg-white/50 rounded w-1/2 mx-auto"></div>
                  <div className="h-2 bg-white/50 rounded w-3/4 mx-auto"></div>
                  <div className="h-2 bg-white/50 rounded w-2/3 mx-auto"></div>
                </div>
              </div>
              <div className="h-8 flex justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-white/70"></div>
                <div className="h-2 w-2 rounded-full bg-white/40"></div>
                <div className="h-2 w-2 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default design for other file types
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center border border-white/40">
          <div className="w-12 h-16 bg-white/70 rounded-sm flex flex-col">
            <div className="h-3 w-full bg-white/90"></div>
            <div className="flex-1 flex items-center justify-center p-1">
              <div className="text-xs font-bold text-gray-500 uppercase">{fileExtension}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF document thumbnail
const PDFThumbnail = () => {
  // Array of gradient options for PDFs
  const gradients = [
    "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]",
    "bg-gradient-to-br from-[#FF9A9E] to-[#F6416C]",
    "bg-gradient-to-br from-[#FF512F] to-[#DD2476]",
    "bg-gradient-to-br from-[#FF5E62] to-[#FF9966]"
  ];
  
  // Select a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-5">
          {/* PDF header with icon */}
          <div className="flex items-center mb-4">
            <div className="w-8 h-10 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs font-bold mr-3">
              PDF
            </div>
            <div className="h-3 bg-white/70 rounded w-1/2"></div>
          </div>
          
          {/* PDF content */}
          <div className="space-y-2">
            <div className="h-2 bg-white/70 rounded w-full"></div>
            <div className="h-2 bg-white/70 rounded w-5/6"></div>
            <div className="h-2 bg-white/70 rounded w-full"></div>
            <div className="h-2 bg-white/70 rounded w-4/5"></div>
          </div>
          
          {/* PDF footer with page number */}
          <div className="mt-auto pt-4 flex justify-between items-center">
            <div className="h-2 bg-white/70 rounded w-1/4"></div>
            <div className="text-white/70 text-xs px-2 py-1 bg-white/20 rounded">
              1/12
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Word document thumbnail
const DOCXThumbnail = () => {
  // Array of gradient options for Word docs
  const gradients = [
    "bg-gradient-to-br from-[#4F86F7] to-[#48D1CC]",
    "bg-gradient-to-br from-[#0093E9] to-[#80D0C7]",
    "bg-gradient-to-br from-[#00B4DB] to-[#0083B0]",
    "bg-gradient-to-br from-[#56CCF2] to-[#2F80ED]"
  ];
  
  // Select a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  return (
    <div className={`w-full h-full ${randomGradient} relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-4">
          {/* Word doc header with icon - reduced size */}
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold mr-2 -mt-2">
              W
            </div>
            <div className="h-2.5 bg-white/70 rounded w-1/2"></div>
          </div>
          
          {/* Word doc content with formatting - reduced size and spacing */}
          <div className="space-y-1.5">
            <div className="h-2.5 bg-white/70 rounded w-3/4"></div>
            <div className="space-y-1">
              <div className="h-1.5 bg-white/70 rounded w-full"></div>
              <div className="h-1.5 bg-white/70 rounded w-5/6"></div>
            </div>
            <div className="h-2.5 bg-white/70 rounded w-2/3 mt-1"></div>
            <div className="space-y-1">
              <div className="h-1.5 bg-white/70 rounded w-full"></div>
              <div className="h-1.5 bg-white/70 rounded w-4/5"></div>
            </div>
          </div>
          
          {/* Word doc footer - reduced size */}
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/40 mr-1"></div>
              <div className="h-1.5 bg-white/70 rounded w-10"></div>
            </div>
            <div className="text-white/70 text-xs">
              2h ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileThumbnail: React.FC<FileThumbnailProps> = ({ fileName, fileUrl, className = '', type }) => {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  const cacheKey = useRef(getCacheKey(fileName, type, fileUrl));
  const [randomValues, setRandomValues] = useState<any>(null);
  
  useEffect(() => {
    // Check if we already have cached values for this thumbnail
    if (thumbnailCache.has(cacheKey.current)) {
      setRandomValues(thumbnailCache.get(cacheKey.current));
      return;
    }
    
    // Generate new random values based on the thumbnail type
    const newRandomValues: any = {};
    
    if (type === "decks") {
      const gradients = [
        "bg-gradient-to-br from-[#F6B144] to-[#FE7EF4]",
        "bg-gradient-to-br from-[#FF9966] to-[#FF5E62]",
        "bg-gradient-to-br from-[#FFCC33] to-[#FF6B6B]",
        "bg-gradient-to-br from-[#FFD700] to-[#FFA07A]",
        "bg-gradient-to-br from-[#FFA500] to-[#FF4500]",
        "bg-gradient-to-br from-[#FF8C00] to-[#FF1493]",
        "bg-gradient-to-br from-[#FFB347] to-[#FFCC33]",
        "bg-gradient-to-br from-[#FF7F50] to-[#FF69B4]"
      ];
      newRandomValues.gradient = gradients[Math.floor(Math.random() * gradients.length)];
      newRandomValues.rotation1 = Math.floor(Math.random() * 6) + 1;
      newRandomValues.rotation2 = -Math.floor(Math.random() * 6) - 1;
    } else if (type === "quizzes") {
      const gradients = [
        "bg-gradient-to-br from-[#C66EC5] to-[#FC608D]",
        "bg-gradient-to-br from-[#7F00FF] to-[#E100FF]",
        "bg-gradient-to-br from-[#9D50BB] to-[#6E48AA]",
        "bg-gradient-to-br from-[#8A2387] to-[#E94057]",
        "bg-gradient-to-br from-[#DA22FF] to-[#9733EE]",
        "bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0]",
        "bg-gradient-to-br from-[#B621FE] to-[#1FD1F9]",
        "bg-gradient-to-br from-[#6A11CB] to-[#2575FC]"
      ];
      newRandomValues.gradient = gradients[Math.floor(Math.random() * gradients.length)];
      newRandomValues.numItems = Math.floor(Math.random() * 3) + 2;
    } else if (type === "studyguides") {
      const gradients = [
        "bg-gradient-to-br from-[#4F86F7] to-[#48D1CC]",
        "bg-gradient-to-br from-[#0093E9] to-[#80D0C7]",
        "bg-gradient-to-br from-[#00B4DB] to-[#0083B0]",
        "bg-gradient-to-br from-[#56CCF2] to-[#2F80ED]",
        "bg-gradient-to-br from-[#2193b0] to-[#6dd5ed]",
        "bg-gradient-to-br from-[#36D1DC] to-[#5B86E5]",
        "bg-gradient-to-br from-[#1A2980] to-[#26D0CE]",
        "bg-gradient-to-br from-[#0575E6] to-[#4A00E0]"
      ];
      newRandomValues.gradient = gradients[Math.floor(Math.random() * gradients.length)];
      newRandomValues.numLines = Math.floor(Math.random() * 2) + 2;
      newRandomValues.lineWidths = [...Array(newRandomValues.numLines)].map(() => 
        `${Math.floor(Math.random() * 30) + 70}%`
      );
    } else if (type === "note") {
      const gradients = [
        "bg-gradient-to-br from-[#A9F1DF] to-[#FFBBEC]",
        "bg-gradient-to-br from-[#E2B0FF] to-[#9F44D3]",
        "bg-gradient-to-br from-[#F5F7FA] to-[#C3CFE2]",
        "bg-gradient-to-br from-[#E0EAFC] to-[#CFDEF3]",
        "bg-gradient-to-br from-[#E6DADA] to-[#274046]",
        "bg-gradient-to-br from-[#74EBD5] to-[#9FACE6]",
        "bg-gradient-to-br from-[#FFFEFF] to-[#D7FFFE]",
        "bg-gradient-to-br from-[#E6E9F0] to-[#9733EE]"
      ];
      
      newRandomValues.gradient = gradients[Math.floor(Math.random() * gradients.length)];
      newRandomValues.numLines = Math.floor(Math.random() * 3) + 3;
      newRandomValues.lineWidths = [...Array(newRandomValues.numLines)].map(() => 
        `${Math.floor(Math.random() * 40) + 60}%`
      );
      
      // For collaborative notes
      newRandomValues.cursor1X = Math.floor(Math.random() * 80);
      newRandomValues.cursor1Y = Math.floor(Math.random() * 60);
      newRandomValues.cursor2X = Math.floor(Math.random() * 80);
      newRandomValues.cursor2Y = Math.floor(Math.random() * 60) + 20;
      newRandomValues.cursor3X = Math.floor(Math.random() * 80);
      newRandomValues.cursor3Y = Math.floor(Math.random() * 40) + 40;
      
      const cursorColors = [
        { fill: "#3B82F6", stroke: "#3B82F6" }, // Blue
        { fill: "#EC4899", stroke: "#EC4899" }, // Pink
        { fill: "#8B5CF6", stroke: "#8B5CF6" }  // Purple
      ];
      newRandomValues.shuffledColors = [...cursorColors].sort(() => Math.random() - 0.5);
    } else if (fileExtension) {
      // For file-based thumbnails
      let gradientSet;
      if (["jpg", "jpeg", "png", "gif", "webp", "mp4", "avi", "mov", "wmv"].includes(fileExtension)) {
        gradientSet = [
          "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]",
          "bg-gradient-to-br from-[#FFECD2] to-[#FCB69F]",
          "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]",
          "bg-gradient-to-br from-[#A18CD1] to-[#FBC2EB]"
        ];
      } else if (["mp3", "wav", "ogg", "flac"].includes(fileExtension)) {
        gradientSet = [
          "bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC]",
          "bg-gradient-to-br from-[#A6C0FE] to-[#F68084]",
          "bg-gradient-to-br from-[#D4FC79] to-[#96E6A1]",
          "bg-gradient-to-br from-[#85FFBD] to-[#FFFB7D]"
        ];
        
        // Audio specific
        newRandomValues.waveformHeights = [...Array(20)].map(() => `${Math.random() * 60 + 20}%`);
      } else if (["pdf"].includes(fileExtension)) {
        gradientSet = [
          "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]",
          "bg-gradient-to-br from-[#FF9A9E] to-[#F6416C]",
          "bg-gradient-to-br from-[#FF512F] to-[#DD2476]",
          "bg-gradient-to-br from-[#FF5E62] to-[#FF9966]"
        ];
      } else if (["doc", "docx"].includes(fileExtension)) {
        gradientSet = [
          "bg-gradient-to-br from-[#4F86F7] to-[#48D1CC]",
          "bg-gradient-to-br from-[#0093E9] to-[#80D0C7]",
          "bg-gradient-to-br from-[#00B4DB] to-[#0083B0]",
          "bg-gradient-to-br from-[#56CCF2] to-[#2F80ED]"
        ];
      } else {
        gradientSet = [
          "bg-gradient-to-br from-[#E0EAFC] to-[#CFDEF3]",
          "bg-gradient-to-br from-[#F5F7FA] to-[#C3CFE2]",
          "bg-gradient-to-br from-[#E6DADA] to-[#274046]",
          "bg-gradient-to-br from-[#A1C4FD] to-[#C2E9FB]"
        ];
      }
      
      newRandomValues.gradient = gradientSet[Math.floor(Math.random() * gradientSet.length)];
    }
    
    // Save the random values to both state and cache
    setRandomValues(newRandomValues);
    thumbnailCache.set(cacheKey.current, newRandomValues);
  }, [cacheKey]);
  
  // Don't render until random values are ready
  if (!randomValues) {
    return <div className={`w-full h-48 relative ${className} bg-gray-100 animate-pulse`}></div>;
  }

  // Render specialized thumbnails based on type
  if (type === "decks") {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <div className={`w-full h-full ${randomValues.gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center transform rotate-${randomValues.rotation1} border border-white/30`}>
                <div className="w-full p-3 text-white text-center">
                  <div className="h-2 bg-white/60 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-2 bg-white/60 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
              <div className={`w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center transform rotate-${randomValues.rotation2} absolute border border-white/30`}>
                <div className="w-full p-3 text-white text-center">
                  <div className="h-2 bg-white/60 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-2 bg-white/60 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "quizzes") {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <div className={`w-full h-full ${randomValues.gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center border border-white/30">
              <div className="w-full p-3 text-white">
                {[...Array(randomValues.numItems)].map((_, i) => (
                  <div key={i} className="flex items-center mb-3">
                    <div className="h-4 w-4 rounded-full bg-white/60 mr-2"></div>
                    <div className="h-2 bg-white/60 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "studyguides") {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <div className={`w-full h-full ${randomValues.gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center border border-white/30">
              <div className="w-full p-3 text-white">
                <div className="h-3 bg-white/60 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  {[...Array(randomValues.numLines)].map((_, i) => (
                    <div key={i} className="h-2 bg-white/60 rounded" style={{ width: randomValues.lineWidths[i] }}></div>
                  ))}
                </div>
                <div className="h-3 bg-white/60 rounded w-1/3 mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "note") {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <div className={`w-full h-full ${randomValues.gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-5">
              <div className="h-4 bg-white/70 rounded w-1/2 mb-4"></div>
              <div className="space-y-3 relative">
                {[...Array(randomValues.numLines)].map((_, i) => (
                  <div key={i} className="h-2 bg-white/70 rounded" style={{ width: randomValues.lineWidths[i] }}></div>
                ))}
                
                {/* First cursor - random position */}
                <div className="absolute" style={{ left: `${randomValues.cursor1X}%`, top: `${randomValues.cursor1Y}%` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={randomValues.shuffledColors[0].fill} stroke={randomValues.shuffledColors[0].stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {/* Second cursor - random position */}
                <div className="absolute" style={{ left: `${randomValues.cursor2X}%`, top: `${randomValues.cursor2Y}%` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={randomValues.shuffledColors[1].fill} stroke={randomValues.shuffledColors[1].stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {/* Third cursor - random position */}
                <div className="absolute" style={{ left: `${randomValues.cursor3X}%`, top: `${randomValues.cursor3Y}%` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={randomValues.shuffledColors[2].fill} stroke={randomValues.shuffledColors[2].stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex justify-between items-center">
                {/* Collaboration indicators */}
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-400 border-2 border-white"></div>
                  <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-white"></div>
                  <div className="w-5 h-5 rounded-full bg-purple-400 border-2 border-white"></div>
                </div>
                <div className="h-6 w-6 rounded-sm bg-white/40 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-sm bg-white/90"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (["pdf"].includes(fileExtension || "")) {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <div className={`w-full h-full ${randomValues.gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-5">
              {/* PDF header with icon */}
              <div className="flex items-center mb-4">
                <div className="w-8 h-10 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs font-bold mr-3">
                  PDF
                </div>
                <div className="h-3 bg-white/70 rounded w-1/2"></div>
              </div>
              
              {/* PDF content */}
              <div className="space-y-2">
                <div className="h-2 bg-white/70 rounded w-full"></div>
                <div className="h-2 bg-white/70 rounded w-5/6"></div>
                <div className="h-2 bg-white/70 rounded w-full"></div>
                <div className="h-2 bg-white/70 rounded w-4/5"></div>
              </div>
              
              {/* PDF footer with page number */}
              <div className="mt-auto pt-4 flex justify-between items-center">
                <div className="h-2 bg-white/70 rounded w-1/4"></div>
                <div className="text-white/70 text-xs px-2 py-1 bg-white/20 rounded">
                  1/12
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (["doc", "docx"].includes(fileExtension || "")) {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <div className={`w-full h-full ${randomValues.gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center border border-white/40 p-4">
              {/* Word doc header with icon - reduced size */}
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold mr-2 -mt-2">
                  W
                </div>
                <div className="h-2.5 bg-white/70 rounded w-1/2"></div>
              </div>
              
              {/* Word doc content with formatting - reduced size and spacing */}
              <div className="space-y-1.5">
                <div className="h-2.5 bg-white/70 rounded w-3/4"></div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-white/70 rounded w-full"></div>
                  <div className="h-1.5 bg-white/70 rounded w-5/6"></div>
                </div>
                <div className="h-2.5 bg-white/70 rounded w-2/3 mt-1"></div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-white/70 rounded w-full"></div>
                  <div className="h-1.5 bg-white/70 rounded w-4/5"></div>
                </div>
              </div>
              
              {/* Word doc footer - reduced size */}
              <div className="mt-3 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40 mr-1"></div>
                  <div className="h-1.5 bg-white/70 rounded w-10"></div>
                </div>
                <div className="text-white/70 text-xs">
                  2h ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension || "")) {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <Image src={fileUrl!} alt={fileName} fill style={{ objectFit: "cover" }} />
      </div>
    );
  }

  if (["mp3", "wav", "ogg", "flac"].includes(fileExtension || "")) {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <div className="w-full h-full bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/40 overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full h-20 relative">
                  {/* More natural audio visualization */}
                  <div className="absolute inset-0 flex items-center justify-center space-x-1">
                    {randomValues.waveformHeights.map((height: string, i: number) => (
                      <div 
                        key={i} 
                        className="w-1 bg-white/60 rounded-full"
                        style={{ height }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-10 bg-white/10 backdrop-blur-sm flex items-center justify-between px-4">
                <div className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-3 border-t-transparent border-l-6 border-l-[#8EC5FC] border-b-3 border-b-transparent ml-0.5"></div>
                </div>
                <div className="flex-1 mx-3">
                  <div className="h-1.5 bg-white/20 rounded-full">
                    <div className="h-full w-1/3 bg-white/70 rounded-full"></div>
                  </div>
                </div>
                <div className="text-white/70 text-xs">1:24</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For any other file type
  return (
    <div className={`w-full h-48 relative ${className}`}>
      <div className={`w-full h-full ${randomValues.gradient} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center border border-white/40">
            <div className="w-12 h-16 bg-white/70 rounded-sm flex flex-col">
              <div className="h-3 w-full bg-white/90"></div>
              <div className="flex-1 flex items-center justify-center p-1">
                <div className="text-xs font-bold text-gray-500 uppercase">{fileExtension}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileThumbnail;