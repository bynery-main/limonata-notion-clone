"use client";

import QuillEditor from '@/components/quill-editor/quill-editor';
import React from 'react';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export const dynamic = 'force-dynamic';

const File = async ({ params }: { params: { workspaceId: string, folderId: string, fileId: string } }) => {
  const fetchFileDetails = async () => {
    let fileRef = doc(db, 'workspaces', params.workspaceId, 'folders', params.folderId, 'files', params.fileId);
    let fileSnap = await getDoc(fileRef);

    if (!fileSnap.exists()) {
      fileRef = doc(db, 'workspaces', params.workspaceId, 'folders', params.folderId, 'notes', params.fileId);
      fileSnap = await getDoc(fileRef);
    }

    return fileSnap;
  };

  const fileSnap = await fetchFileDetails();

  if (!fileSnap.exists()) {
    return <div>File not found.</div>;
  }

  const data = fileSnap.data();
  const fileName = data.name || 'No Name';
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  const fileUrl = data.url;

  if (fileUrl) {
    console.log('File URL:', fileUrl);
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
  } else {
    return (
      <div className="relative">
        <QuillEditor
          dirType="file"
          fileId={params.fileId}
          dirDetails={{ ...data, workspaceId: params.workspaceId, folderId: params.folderId }}
        />
      </div>
    );
  }
};

export default File;
