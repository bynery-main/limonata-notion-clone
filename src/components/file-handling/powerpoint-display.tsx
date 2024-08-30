import React from 'react';

interface PowerpointDisplayProps {
  fileUrl: string;
}

const PowerpointDisplay: React.FC<PowerpointDisplayProps> = ({ fileUrl }) => {
  return (
    <div>
      <p>
        PowerPoint files are not supported for in-browser viewing.
        <a href={fileUrl} download> Download</a> the file to view.
      </p>
    </div>
  );
};

export default PowerpointDisplay;
