import React from 'react';

interface PowerpointDisplayProps {
  fileUrl: string;
  fileName?: string;
}

const PowerpointDisplay: React.FC<PowerpointDisplayProps> = ({ fileUrl, fileName }) => {
  // Extract file name from URL if not provided
  const displayFileName = fileName || fileUrl.split('/').pop()?.split('?')[0] || 'PowerPoint file';

  return (
    <div className="powerpoint-display mb-2">
      <p className="mb-2">
        PowerPoint files are not supported for in-browser viewing.
      </p>
      <a 
        href={fileUrl} 
        download={displayFileName}
        className="text-blue-500 hover:text-blue-700 underline"
      >
        Download
      </a>
    </div>
  );
};

export default PowerpointDisplay;