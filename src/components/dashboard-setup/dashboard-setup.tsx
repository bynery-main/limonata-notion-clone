import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase/firebaseConfig";
import { Plus } from "lucide-react";
import CollaboratorSearch from "../collaborator-setup/collaborator-search";
import { Button } from "../ui/button";

interface InitializeWorkspaceResponse {
  message: string;
  workspaceId: string;
}

const DashboardSetup = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
  const user = auth.currentUser;
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceType, setWorkspaceType] = useState("private"); // new state for workspace type
  const [existingCollaborators, setExistingCollaborators] = useState<string[]>([]); // List of collaborator UIDs
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const functions = getFunctions();
  const initializeWorkspace = httpsCallable(functions, "initializeWorkspace");

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceName || !workspaceDescription || (workspaceType === "shared" && existingCollaborators.length === 0)) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await initializeWorkspace({
        userId: user!.uid,
        workspaceName,
        workspaceDescription,
        workspaceType,
        collaborators: existingCollaborators,
      });

      const data = result.data as InitializeWorkspaceResponse;

      if (data.workspaceId) {
        console.log(data.message);
        onSuccess(); // Call onSuccess to close the popup
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
    e.stopPropagation(); // Prevent event propagation to the overlay
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black backdrop-blur-lg"></div>
      <div className="relative opacity-100 bg-white rounded-[53px] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.3)] p-10 w-[606px] z-[500]" onClick={handlePopupClick}>
        <div className="text-center mb-8">
          <h2 className="font-medium text-black text-3xl mb-2">Create a Workspace</h2>
          <p className="font-light text-black text-[15px]">
            A workspace is a place where you can invite others to upload their notes, videos, recordings and more.
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="flex flex-col items-center">
          <input
            type="text"
            placeholder="Workspace Name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full bg-[#e4e4e4] rounded-[29px] px-4 py-2 mb-2 font-light text-[#8a8a8a] text-[15px] focus:outline-none"
          />
          <input
            type="text"
            placeholder="Workspace Description"
            value={workspaceDescription}
            onChange={(e) => setWorkspaceDescription(e.target.value)}
            className="w-full bg-[#e4e4e4] rounded-[29px] px-4 py-2 mb-4 font-light text-[#8a8a8a] text-[15px] focus:outline-none"
          />
          <div className="mb-4">
            <label className="mr-4 font-medium text-black">Type:</label>
            <label>
              <input
                type="radio"
                value="private"
                checked={workspaceType === 'private'}
                onChange={() => setWorkspaceType('private')}
              /> Private
            </label>
            <label className="ml-6">
              <input
                type="radio"
                value="shared"
                checked={workspaceType === 'shared'}
                onChange={() => setWorkspaceType('shared')}
              /> Shared
            </label>
          </div>
          {workspaceType === 'shared' && (
            <CollaboratorSearch existingCollaborators={existingCollaborators} currentUserUid={user!.uid}>
              <Button type="button" className="text-sm mt-4">
                <Plus />
                Add Collaborators
              </Button>
            </CollaboratorSearch>
          )}
          <div className="flex space-x-4">
            <button
              type="submit"
              className={`bg-[#ff5924] text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md transition-colors ${loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#e54e1f]'}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardSetup;
