import { getFileDetails } from '@/lib/queries/queries';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import React from 'react';

export const dynamic = 'force-dynamic';

const UploadFileViewer = async ({ params }: { params: { workspaceId: string, folderId: string, uploadId: string } }) => {
  const { data } = await getFileDetails(params.uploadId);

  if (!data || !data.url) {
    return <div>File not found or no URL available</div>;
  }

  const fileUrl = data.url;
  const fileName = data.name;
  const fileExtension = fileName.split('.').pop();

  return (
    <div className="relative">
      <h1 className="text-xl mb-4">{fileName}</h1>
      {fileExtension === 'pdf' ? (
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js`}>
          <div style={{ height: '750px' }}>
            <Viewer fileUrl={fileUrl} />
          </div>
        </Worker>
      ) : (
        <div>
          <p>File type not supported for preview. <a href={fileUrl} download>Download</a> the file to view.</p>
        </div>
      )}
    </div>
  );
};

export default UploadFileViewer;
