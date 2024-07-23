import React, { useState } from "react";
import { useRouter } from "next/navigation";  // Correct import for Next.js 13
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, collection } from "firebase/firestore";

interface DashboardSetupProps {
  userId: string;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({ userId }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const router = useRouter();

  const createWorkspace = async () => {
    if (!workspaceName || !workspaceDescription) {
      alert("Please fill in all fields.");
      return;
    }

    // Reference to the user's workspace collection
    const workspaceRef = doc(collection(db, `users/${userId}/workspace`));

    // Set the workspace document
    try {
      await setDoc(workspaceRef, {
        name: workspaceName,
        description: workspaceDescription,
      });
      console.log("Workspace created successfully");
      alert("Workspace created successfully");
      // Use navigate from next/navigation
      router.push(`/dashboard/${workspaceRef.id}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Error creating workspace");
    }
  };

  return (
    <div>
      <h1>Dashboard Setup</h1>
      <form onSubmit={(e) => { e.preventDefault(); createWorkspace(); }}>
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
