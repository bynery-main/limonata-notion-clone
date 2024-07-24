"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { fetchWorkspaces, Workspace } from "@/lib/db/workspaces/get-workspaces";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [collaboratorWorkspaces, setCollaboratorWorkspaces] = useState<Workspace[]>([]);
  const [showDS, setShowDS] = useState(false);

  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const owned = await fetchWorkspaces("owners", user.uid);
        const collaborated = await fetchWorkspaces("collaborators", user.uid);

        setOwnedWorkspaces(owned);
        setCollaboratorWorkspaces(collaborated);
      } else {
        console.error("No document for this user.");
        setOwnedWorkspaces([]);
        setCollaboratorWorkspaces([]);
      }
    };

    if (!loading) {
      loadWorkspaces();
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {ownedWorkspaces.length > 0 || collaboratorWorkspaces.length > 0 ? (
        <WorkspaceList
          ownedWorkspaces={ownedWorkspaces}
          collaboratorWorkspaces={collaboratorWorkspaces}
        />
      ) : (
        <div className="bg-background h-screen flex justify-center items-center">
          <DashboardSetup />
        </div>
      )}
      <div className="mt-6">
        <Button onClick={() => setShowDS(true)}>Show Dashboard Setup</Button>
        {showDS && <DashboardSetup />}
      </div>
    </div>
  );
};

const WorkspaceList: React.FC<{
  ownedWorkspaces: Workspace[];
  collaboratorWorkspaces: Workspace[];
}> = ({ ownedWorkspaces, collaboratorWorkspaces }) => (
  <div>
    <WorkspaceSection title="Your Owned Workspaces" workspaces={ownedWorkspaces} />
    <WorkspaceSection title="Your Collaborator Workspaces" workspaces={collaboratorWorkspaces} />
  </div>
);

const WorkspaceSection: React.FC<{
  title: string;
  workspaces: Workspace[];
}> = ({ title, workspaces }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    {workspaces.length > 0 ? (
      <ul className="space-y-2">
        {workspaces.map((workspace) => (
          <li key={workspace.id} className="bg-gray-100 p-3 rounded-lg">
            <span className="font-semibold">{workspace.name}</span>
            <span className="text-sm text-gray-500 ml-2">(ID: {workspace.id})</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">No workspaces found.</p>
    )}
  </div>
);

export default Dashboard;