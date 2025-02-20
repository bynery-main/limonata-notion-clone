import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase/firebaseConfig";
import { Plus, SmileIcon, X } from "lucide-react";
import CollaboratorSearch from "../collaborator-setup/collaborator-search";
import { Button } from "../ui/button";
import Picker from '@emoji-mart/react';
import { workerData } from "worker_threads";
import { set } from "zod";

interface Collaborator {
  uid: string;
  email: string;
}

interface InitializeWorkspaceResponse {
  message: string;
  workspaceId: string;
}
interface DashboardSetupProps {
  onCancel: () => void;
  user: { uid: string } | null;
  existingCollaborators: Collaborator[];
  workspaceId: string;
}
const DashboardSetup = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
  const user = auth.currentUser;
  const [selectedCollaborators, setSelectedCollaborators] = useState<{ uid: string; email: string }[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState("🍋"); // Default emoji
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceType, setWorkspaceType] = useState("private");
  const [existingCollaborators, setExistingCollaborators] = useState<{ uid: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const functions = getFunctions();
  const initializeWorkspace = httpsCallable(functions, "initializeWorkspace");
  const [workspaceId, setWorkspaceId] = useState("");

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) &&
          emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addCollaborator = (collaborator: { uid: string; email: string }) => {
    setSelectedCollaborators(prev => [...prev, collaborator]);
  };

  const handleEmojiSelect = (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceName || !workspaceDescription) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await initializeWorkspace({
        workspaceName,
        workspaceDescription,
        emoji,
        userId: user!.uid,
        collaborators: selectedCollaborators.map(collab => collab.uid), // Only send UIDs as an array of strings
      });
  
      const data = result.data as InitializeWorkspaceResponse;

      setWorkspaceId(data.workspaceId);
  
      if (data.workspaceId) {
        console.log(data.message);
        onSuccess();
        router.push(`/dashboard/${data.workspaceId}`);
      } else {
        throw new Error('Workspace creation failed: No ID returned');
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
  };


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[9980]"></div>
      <div className="relative bg-white rounded-[32px] shadow-2xl p-8 w-[480px] max-w-[90vw] z-[10000] border-[2px] border-orange-500" onClick={handlePopupClick}>
        <div className="text-center mb-6">
          <h2 className="font-semibold text-gray-900 text-2xl mb-2">Create a Workspace</h2>
          <p className="text-gray-600 text-sm">
            A workspace is a place where you can take notes, upload all your study resources, integrate them with our AI features all while collaborating with your friends.
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="h-10 w-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 border-[1px]"
            >
              <span className="text-xl ">{emoji}</span>
            </button>
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute left-12 top-0 z-20"
                style={{
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <Picker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
            <input
              type="text"
              placeholder="Workspace Name (e.g. Math 101)"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border-[1px] border-orange-500"
            />
          </div>
          <input
            type="text"
            placeholder="Workspace Description"
            value={workspaceDescription}
            onChange={(e) => setWorkspaceDescription(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-4 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border-[1px] border-orange-500"
          />
        {/* Add a radio button to select the workspace type        
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-orange-500"
                name="workspaceType"
                value="private"
                checked={workspaceType === 'private'}
                onChange={() => setWorkspaceType('private')}
              />
              <span className="ml-2 text-sm text-gray-700">Private</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-orange-500"
                name="workspaceType"
                value="shared"
                checked={workspaceType === 'shared'}
                onChange={() => setWorkspaceType('shared')}
              />
              <span className="ml-2 text-sm text-gray-700">Shared</span>
            </label>
          </div>
          -->
          {workspaceType === 'shared' && (
            <div className="space-y-2">
              <CollaboratorSearch
                existingCollaborators={existingCollaborators.map(c => c.uid)}
                currentUserUid={user?.uid ?? ''}
                onAddCollaborator={addCollaborator}
                onOpen={() => {}}
                style={{ zIndex: 10010 }}
                workspaceId={workspaceId}
              >
                <Button type="button" variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Collaborators
                </Button>
              </CollaboratorSearch>
              {selectedCollaborators.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Selected Collaborators:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollaborators.map(collab => (
                      <div key={collab.uid} className="flex items-center bg-white rounded-full px-3 py-1 text-sm text-gray-700 shadow-sm">
                        <span>{collab.email}</span>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
            */}   
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardSetup;