import React, { useEffect, useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import mammoth from 'mammoth';

interface DocumentDisplayProps {
  fileUrl: string;
  fileExtension: string;
}

const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ fileUrl, fileExtension }) => {
  const [docxContent, setDocxContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocxFile = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch the document');
        }

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxContent(result.value);
      } catch (err) {
        console.error(err);
        setError('Failed to load the document.');
      }
    };

    if (fileExtension === 'docx') {
      fetchDocxFile();
    }
  }, [fileUrl, fileExtension]);

  if (fileExtension === 'pdf') {
    return (
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <div style={{ height: '750px' }}>
          <Viewer fileUrl={fileUrl} />
        </div>
      </Worker>
    );
  }

  if (fileExtension === 'docx') {
    if (error) {
      return <div>Error: {error}</div>;
    }

    if (docxContent) {
      return (
        <div
          style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}
          dangerouslySetInnerHTML={{ __html: docxContent }}
        />
      );
    }

    return <div>Loading document...</div>;
  }

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
