'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getFunctions, httpsCallable } from "firebase/functions";
import { Toaster, toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/auth-provider/AuthProvider';

const SettingsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const { user } = useAuth();
  const currentUserUid = user?.uid || "";

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const idIndex = pathParts.indexOf('dashboard') + 1;
      if (idIndex > 0 && pathParts[idIndex]) {
        setWorkspaceId(pathParts[idIndex]);
      }
    }
  }, [pathname]);

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) {
      toast.error('Workspace ID not found.');
      return;
    }

    const functions = getFunctions();
    const deleteWorkspace = httpsCallable(functions, "deleteWorkspace");

    try {
      console.log('Sending request to delete workspace with ID:', workspaceId);
      const result = await deleteWorkspace({ workspaceId });
      console.log('Received response:', result.data);
      toast.success('Workspace deleted successfully.');
      router.push("/dashboard"); // Redirect to dashboard after workspace deletion
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error('Error deleting workspace. Please try again.');
    }
  };

  const handleCancelWorkspace = () => {
    setShowWorkspaceModal(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, onCancel: () => void) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div>
      <Toaster />
      <h1>Settings</h1>

      <Button
        onClick={() => setShowWorkspaceModal(true)}
        style={{
          background: '#ff0000', // Red color for workspace deletion
          color: 'white', // White text
          padding: '10px',
          border: 'none',
          borderRadius: '5px',
          marginTop: '10px', // Add margin for separation
        }}
      >
        Delete Workspace
      </Button>
      {showWorkspaceModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
          onClick={(e) => handleOverlayClick(e, handleCancelWorkspace)}
        >
          <div
            className="relative bg-white rounded-[53px] shadow-2xl p-10 w-[606px] z-[10000]"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', opacity: 1 }} // Ensure the background is fully opaque
          >
            <div className="text-center mb-8">
              <h2 className="font-medium text-black text-3xl mb-2">Are you sure you want to delete this workspace?</h2>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleDeleteWorkspace}
                className="bg-[#ff5924] text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-[#e54e1f] transition-colors"
                style={{ color: 'white' }} // Ensure the text color is white
              >
                Delete Workspace
              </Button>
              <Button
                onClick={handleCancelWorkspace}
                className="bg-gray-300 text-gray-700 font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
