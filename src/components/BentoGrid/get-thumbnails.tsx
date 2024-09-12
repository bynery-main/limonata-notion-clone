import React from 'react';
import Image from 'next/image';

interface FileThumbnailProps {
  fileName: string;
  fileUrl?: string;
  className?: string;
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
const FileThumbnail: React.FC<FileThumbnailProps> = ({ fileName, fileUrl, className = '' }) => {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const pdfExtensions = ["pdf"];
  const docExtensions = ["doc", "docx"];
  const audioExtensions = ["mp3", "wav", "ogg", "flac"];
  const videoExtensions = ["mp4", "avi", "mov", "wmv"];

  if (imageExtensions.includes(fileExtension || "")) {
    return (
      <div className={`w-full h-48 relative ${className}`}>
        <Image src={fileUrl!} alt={fileName} fill style={{ objectFit: "cover" }} />
      </div>
    );
  }

  let emoji = "📝";
  if (pdfExtensions.includes(fileExtension || "")) emoji = "📕";
  else if (docExtensions.includes(fileExtension || "")) emoji = "📘";
  else if (audioExtensions.includes(fileExtension || "")) emoji = "🎵";
  else if (videoExtensions.includes(fileExtension || "")) emoji = "🎥";

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
        <span className="text-4xl z-10">{emoji}</span>
      </div>
    </div>
  );
};

export default FileThumbnail;