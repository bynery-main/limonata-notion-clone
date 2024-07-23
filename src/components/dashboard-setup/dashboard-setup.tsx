import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { User } from "firebase/auth";
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
    <div>
      <h1>Dashboard Setup</h1>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Workspace Name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Workspace Description"
          value={workspaceDescription}
          onChange={(e) => setWorkspaceDescription(e.target.value)}
        />
        <button type="submit">Create Workspace</button>
      </form>
    </div>
  );
};

export default DashboardSetup;
