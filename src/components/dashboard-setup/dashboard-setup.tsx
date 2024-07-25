import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase/firebaseConfig";

// Define an interface for the expected data returned by the cloud function
interface InitializeWorkspaceResponse {
  message: string;
  workspaceId: string;
}

const DashboardSetup = () => {
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
      // Call the cloud function to create the workspace
      const result = await initializeWorkspace({
        userId: user!.uid,
        workspaceName: workspaceName,
        workspaceDescription: workspaceDescription
      });

      // Assert the type of the data returned by the cloud function
      const data = result.data as InitializeWorkspaceResponse;

      if (data.workspaceId) {
        console.log(data.message); // Optional: Log the message from the function
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
    <div className="w-full h-full flex justify-center items-center">
      <div className="relative w-[606px] h-[385px] bg-[#ffffffbf] rounded-[53px] shadow-[0px_0px_6.2px_5px_#00000040] p-10">
        <div className="absolute top-[30px] left-[50%] transform -translate-x-1/2 text-center">
          <div className="font-medium text-black text-3xl">
            Create a Workspace
          </div>
          <p className="font-light text-black text-[15px] mt-2">
            A workspace is a place where you can invite others to upload their notes, videos, recordings and more.
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="mt-[130px] flex flex-col items-center">
          <div className="relative w-[481px] h-[42px] mb-4">
            <input
              type="text"
              placeholder="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full h-full bg-[#e4e4e4] rounded-[29px] px-4 font-light text-[#8a8a8a] text-[15px] focus:outline-none"
            />
          </div>
          <div className="relative w-[481px] h-[42px] mb-4">
            <input
              type="text"
              placeholder="Workspace Description"
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              className="w-full h-full bg-[#e4e4e4] rounded-[29px] px-4 font-light text-[#8a8a8a] text-[15px] focus:outline-none"
            />
          </div>
          <div className="inline-flex flex-col items-center bg-[#ff5924] rounded-[50px] shadow-[5px_5px_10px_#0000001a] px-[30px] py-[15px] mt-4">
            <button type="submit" className="font-normal text-white text-[15px] text-center">
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardSetup;
