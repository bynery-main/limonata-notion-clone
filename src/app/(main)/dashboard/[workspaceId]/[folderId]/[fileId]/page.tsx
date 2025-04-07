"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider/AuthProvider';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import FileHandler from '@/components/file-handling/file-handler';
import { SpaceProvider, useSpace } from "@ably/spaces/react";
import LiveCursors from "@/components/ably/live-cursors";
import AIToolsSidebar from '@/components/ai-tools/ai-tools-sidebar';

interface PageProps {
  params: {
    workspaceId: string;
    folderId: string;
    fileId: string;
  };
}

interface BentoLocation {
  fileId: string;
  folderId: string;
  type: "file" | "note";
}

const FileView = ({ 
  fileData, 
  params, 
  user 
}: { 
  fileData: any; 
  params: PageProps['params']; 
  user: any;
}) => {
  const { space } = useSpace();

  // Set location when user enters a file
  useEffect(() => {
    if (!space || !user || !fileData) return;

    // Always try to update location when entering a file, regardless of how the user got here
    const setLocation = async () => {
      try {
        // Create location data
        const locationData = {
          fileId: params.fileId,
          folderId: params.folderId,
          type: fileData.type
        } as BentoLocation;
        
        // Get current location to avoid unnecessary updates
        const currentLocation = await space.locations.getSelf() as BentoLocation | null;
        
        // Only update if location has changed or is empty
        if (!currentLocation || 
            currentLocation.fileId !== locationData.fileId || 
            currentLocation.folderId !== locationData.folderId) {
          
          // Set the new location - this will automatically clear the old location
          await space.locations.set(locationData);
          console.log('Location set for file viewing:', params.fileId);
        } else {
          console.log('Location already set correctly:', params.fileId);
        }
      } catch (error) {
        console.error('Error setting location:', error);
      }
    };

    // Set location immediately and retry after a delay if needed
    setLocation();
    
    // Set a small timeout as a backup to ensure the space is properly initialized
    const timeoutId = setTimeout(() => {
      setLocation();
    }, 500);

    // Clear location when leaving file
    return () => {
      clearTimeout(timeoutId);
      
      if (space) {
        // When leaving the file, update to workspace location (removing file location)
        // This is crucial to ensure the user doesn't appear in multiple locations
        space.locations.set(null).catch(error => {
          console.error('Error clearing location:', error);
        });
        console.log('Location cleared on file exit');
      }
    };
  }, [space, user, params.fileId, params.folderId, fileData]);

  const refString = fileData?.type === 'file' 
    ? `workspaces/${params.workspaceId}/folders/${params.folderId}/files/${params.fileId}`
    : `workspaces/${params.workspaceId}/folders/${params.folderId}/notes/${params.fileId}`;

  return (
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
  );
};

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

  return (
    <SpaceProvider name={`file-${params.workspaceId}-${params.folderId}-${params.fileId}`}>
      <FileView 
        fileData={fileData} 
        params={params}
        user={user}
      />
    </SpaceProvider>
  );
};

export default Page;
