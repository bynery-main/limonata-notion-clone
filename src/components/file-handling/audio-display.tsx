import React from 'react';

interface AudioDisplayProps {
  fileUrl: string;
}

const AudioDisplay: React.FC<AudioDisplayProps> = ({ fileUrl }) => {
  return (
    <div className="audio-display">
      <audio controls>
        <source src={fileUrl} type="audio/mpeg" />
        <source src={fileUrl} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioDisplay;
