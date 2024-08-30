import React from 'react';

interface ImageDisplayProps {
  fileUrl: string;
  fileName: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ fileUrl, fileName }) => {
  return (
    <div className="image-display">
      <img src={fileUrl} alt={fileName} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default ImageDisplay;
