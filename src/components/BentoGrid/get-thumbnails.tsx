import React from 'react';
import Image from 'next/image';

interface FileThumbnailProps {
  fileName: string;
  fileUrl?: string;
  className?: string;
  type?: string;
}


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

// New components for specialized thumbnails
const FlashcardThumbnail = () => (
  <div className="w-full h-full bg-gradient-to-br from-[#F6B144] to-[#FE7EF4] relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center transform rotate-3 border border-white/30">
        <div className="w-full p-3 text-white text-center">
          <div className="h-2 bg-white/60 rounded w-3/4 mx-auto mb-3"></div>
          <div className="h-2 bg-white/60 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
      <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center transform -rotate-3 absolute border border-white/30">
        <div className="w-full p-3 text-white text-center">
          <div className="h-2 bg-white/60 rounded w-3/4 mx-auto mb-3"></div>
          <div className="h-2 bg-white/60 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);

const QuizThumbnail = () => (
  <div className="w-full h-full bg-gradient-to-br from-[#C66EC5] to-[#FC608D] relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center border border-white/30">
        <div className="w-full p-3 text-white">
          <div className="flex items-center mb-3">
            <div className="h-4 w-4 rounded-full bg-white/60 mr-2"></div>
            <div className="h-2 bg-white/60 rounded w-3/4"></div>
          </div>
          <div className="flex items-center mb-3">
            <div className="h-4 w-4 rounded-full bg-white/60 mr-2"></div>
            <div className="h-2 bg-white/60 rounded w-2/3"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-white/60 mr-2"></div>
            <div className="h-2 bg-white/60 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudyGuideThumbnail = () => (
  <div className="w-full h-full bg-gradient-to-br from-[#4F86F7] to-[#48D1CC] relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center border border-white/30">
        <div className="w-full p-3 text-white">
          <div className="h-3 bg-white/60 rounded w-1/2 mb-3"></div>
          <div className="space-y-2">
            <div className="h-2 bg-white/60 rounded w-full"></div>
            <div className="h-2 bg-white/60 rounded w-5/6"></div>
            <div className="h-2 bg-white/60 rounded w-full"></div>
            <div className="h-2 bg-white/60 rounded w-4/5"></div>
          </div>
          <div className="h-3 bg-white/60 rounded w-1/3 mt-3"></div>
          <div className="space-y-2 mt-2">
            <div className="h-2 bg-white/60 rounded w-5/6"></div>
            <div className="h-2 bg-white/60 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FileThumbnail: React.FC<FileThumbnailProps> = ({ fileName, fileUrl, className = '', type }) => {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const pdfExtensions = ["pdf"];
  const docExtensions = ["doc", "docx"];
  const audioExtensions = ["mp3", "wav", "ogg", "flac"];
  const videoExtensions = ["mp4", "avi", "mov", "wmv"];
  const presentationExtensions = ["ppt", "pptx"];

  // Render specialized thumbnails based on type
  if (type === "decks") {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <FlashcardThumbnail />
      </div>
    );
  }

  if (type === "quizzes") {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <QuizThumbnail />
      </div>
    );
  }

  if (type === "studyguides") {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <StudyGuideThumbnail />
      </div>
    );
  }

  if (imageExtensions.includes(fileExtension || "")) {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <Image src={fileUrl!} alt={fileName} fill style={{ objectFit: "cover" }} />
      </div>
    );
  }

  let emoji = "📝";
  if (pdfExtensions.includes(fileExtension || "")) emoji = "📕";
  else if (imageExtensions.includes(fileExtension || "")) emoji =  "🖼️";
  else if (pdfExtensions.includes(fileExtension || "")) emoji =  "📕";
  else if (docExtensions.includes(fileExtension || "")) emoji =  "📘";
  else if (audioExtensions.includes(fileExtension || "")) emoji =  "🎵";
  else if (videoExtensions.includes(fileExtension || "")) emoji =  "🎥";
  else if (presentationExtensions.includes(fileExtension || "")) emoji =  "📊";

  return (
    <div className={`w-full h-48 relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Blurred Background */}
      <div className="absolute inset-0 flex items-center justify-center filter blur-sm">
        {audioExtensions.includes(fileExtension || "") ? (
          <div className="w-full h-full">
            <WaveformIcon />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TextSkeleton />
          </div>
        )}
      </div>
      
      {/* Emoji overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl">{emoji}</span>
      </div>
    </div>
  );
};

export default FileThumbnail;