import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase/firebaseConfig";

interface InitializeWorkspaceResponse {
  message: string;
  workspaceId: string;
}

const DashboardSetup = ({ onCancel }: { onCancel: () => void }) => {
  const user = auth.currentUser;
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const router = useRouter();
  const functions = getFunctions();
  const initializeWorkspace = httpsCallable(functions, "initializeWorkspace");

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceName || !workspaceDescription) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const result = await initializeWorkspace({
        userId: user!.uid,
        workspaceName: workspaceName,
        workspaceDescription: workspaceDescription
      });

      const data = result.data as InitializeWorkspaceResponse;

      if (data.workspaceId) {
        console.log(data.message);
        router.push(`/dashboard/${data.workspaceId}`);
      } else {
        throw new Error('Workspace creation failed: No ID returned');
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black backdrop-blur-lg"></div>
      <div className="relative bg-white rounded-[53px]  shadow-2xl p-10 w-[606px] z-[9999]">
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
            className="w-full bg-[#e4e4e4] rounded-[29px] px-4 py-2 mb-4 font-light text-[#8a8a8a] text-[15px] focus:outline-none"
          />
          <input
            type="text"
            placeholder="Workspace Description"
            value={workspaceDescription}
            onChange={(e) => setWorkspaceDescription(e.target.value)}
            className="w-full bg-[#e4e4e4] rounded-[29px] px-4 py-2 mb-6 font-light text-[#8a8a8a] text-[15px] focus:outline-none"
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-[#ff5924] text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-[#e54e1f] transition-colors"
            >
              Create Workspace
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