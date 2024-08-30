import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfDisplayProps {
  fileUrl: string;
}

const PdfDisplay: React.FC<PdfDisplayProps> = ({ fileUrl }) => {
  return (
    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js`}>
      <div style={{ height: '750px' }}>
        <Viewer fileUrl={fileUrl} />
      </div>
    </Worker>
  );
};

export default PdfDisplay;
