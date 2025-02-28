"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider/AuthProvider';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import FileHandler from '@/components/file-handling/file-handler';
import { SpaceProvider } from "@ably/spaces/react";
import LiveCursors from "@/components/ably/live-cursors";
import AIToolsSidebar from '@/components/ai-tools/ai-tools-sidebar';

interface PageProps {
  params: {
    workspaceId: string;
    folderId: string;
    fileId: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { user } = useAuth();
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        // First try to fetch from files collection
        const fileDocRef = doc(db, 'workspaces', params.workspaceId, 'folders', params.folderId, 'files', params.fileId);
        const fileDocSnap = await getDoc(fileDocRef);

        if (fileDocSnap.exists()) {
          setFileData({
            ...fileDocSnap.data(),
            id: fileDocSnap.id,
            type: 'file'
          });
        } else {
          // If not found in files, try notes collection
          const noteDocRef = doc(db, 'workspaces', params.workspaceId, 'folders', params.folderId, 'notes', params.fileId);
          const noteDocSnap = await getDoc(noteDocRef);

          if (noteDocSnap.exists()) {
            setFileData({
              ...noteDocSnap.data(),
              id: noteDocSnap.id,
              type: 'note'
            });
          } else {
            console.error('File not found in either collection');
          }
        }
      } catch (error) {
        console.error('Error fetching file data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.fileId) {
      fetchFileData();
    }
  }, [params.workspaceId, params.folderId, params.fileId]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-t-2 border-b-2 border-purple-500 rounded-full mx-5"></div>
        Loading...
      </div>
    );
  }

  const refString = fileData?.type === 'file' 
    ? `workspaces/${params.workspaceId}/folders/${params.folderId}/files/${params.fileId}`
    : `workspaces/${params.workspaceId}/folders/${params.folderId}/notes/${params.fileId}`;

  return (
    <SpaceProvider name={`file-${params.workspaceId}-${params.folderId}-${params.fileId}`}>
      <div className="relative h-[calc(100vh-64px)] flex">
        <div className="flex-1 overflow-auto">
          <LiveCursors user={user} workspaceId={params.workspaceId} />
          <FileHandler
            fileName={fileData?.name || 'Untitled'}
            fileUrl={fileData?.fileUrl}
            fileExtension={fileData?.fileExtension}
            data={fileData}
            params={params}
          />
        </div>
        {user && (
          <AIToolsSidebar 
            refString={refString} 
            type={fileData?.type === 'file' ? 'file' : 'note'} 
            userId={user.uid} 
          />
        )}
      </div>
    </SpaceProvider>
  );
};

export default Page;
