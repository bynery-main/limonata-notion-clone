'use client';

import QuillEditor from '@/components/quill-editor/quill-editor';
import { getFolderDetails } from '@/lib/queries/queries';
import { redirect } from 'next/navigation';
import React from 'react';
import { SpaceProvider } from "@ably/spaces/react";
import LiveCursors from "@/components/ably/live-cursors";
import { useAuth } from "@/components/auth-provider/AuthProvider";

// Create a client component wrapper for the space functionality
const FolderContent = ({ 
  folderId, 
  workspaceId,
  dirDetails 
}: { 
  folderId: string;
  workspaceId: string;
  dirDetails: any;
}) => {
  const { user } = useAuth();

  return (
    <SpaceProvider name={`folder-${workspaceId}-${folderId}`}>
      <div className="relative">
        <LiveCursors user={user} workspaceId={workspaceId}/>
        <div className='relative hidden'>
        <QuillEditor
          dirType="folder"
          fileId={folderId}
          dirDetails={dirDetails}
        />
        </div>
      </div>
    </SpaceProvider>
  );
};

// Keep the main page component as a server component
const FolderPage = async ({ 
  params 
}: { 
  params: { 
    folderId: string;
    workspaceId: string;
  }
}) => {
  const { data } = await getFolderDetails(params.folderId);

  return (
    <div className="relative">
      <FolderContent 
        folderId={params.folderId}
        workspaceId={params.workspaceId}
        dirDetails={data || {}}
      />
    </div>
  );
};

export const dynamic = 'force-dynamic';
export default FolderPage;