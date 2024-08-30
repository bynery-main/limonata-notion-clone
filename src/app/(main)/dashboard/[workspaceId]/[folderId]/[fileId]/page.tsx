"use client";

import React from 'react';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import FileHandler from '@/components/file-handling/file-handler';

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

  return (
    <FileHandler
      fileName={fileName}
      fileUrl={fileUrl}
      fileExtension={fileExtension}
      data={data}
      params={params}
    />
  );
};

export default File;
