import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface DocumentDisplayProps {
  fileUrl: string;
  fileExtension: string;
}

const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ fileUrl, fileExtension }) => {
  if (fileExtension === 'pdf') {
    return (
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <div style={{ height: '750px' }}>
          <Viewer fileUrl={fileUrl} />
        </div>
      </Worker>
    );
  }

  if (fileExtension === 'docx' || fileExtension === 'doc') {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
        width="100%"
        height="750px"
        frameBorder="0"
        title="Word Document Viewer"
      ></iframe>
    );
  }

  // For simplicity, we'll handle other document types as downloadable files.
  return (
    <div>
      <p>
        This document type ({fileExtension}) is not supported for in-browser viewing.
        <a href={fileUrl} download> Download</a> the file to view.
      </p>
    </div>
  );
};

export default DocumentDisplay;
