"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

interface Workspace {
  id: string;
  name: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [collaboratorWorkspaces, setCollaboratorWorkspaces] = useState<Workspace[]>([]);

  const [showDS, setShowDS] = useState(false);

  const handleButtonClick = () => {
    setShowDS(true);
  };

  useEffect(() => {
    const fetchUserWorkspaces = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Query for workspaces where user is owner
        const ownedWorkspacesQuery = query(
          collection(db, "workspaces"),
          where("owners", "array-contains", user.uid)
        );
        const ownedWorkspacesSnapshot = await getDocs(ownedWorkspacesQuery);

        // Query for workspaces where user is collaborator
        const collaboratorWorkspacesQuery = query(
          collection(db, "workspaces"),
          where("collaborators", "array-contains", user.uid)
        );
        const collaboratorWorkspacesSnapshot = await getDocs(
          collaboratorWorkspacesQuery
        );

        const allWorkspaces = [
          ...ownedWorkspacesSnapshot.docs,
          ...collaboratorWorkspacesSnapshot.docs,
        ].map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Workspace",
        }));

        const ownedWorkspaces = ownedWorkspacesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Workspace",
        }));

        const collaboratorWorkspaces = collaboratorWorkspacesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Workspace",
        }));


        setWorkspaces(allWorkspaces);
        setOwnedWorkspaces(ownedWorkspaces);
        setCollaboratorWorkspaces(collaboratorWorkspaces);
      } else {
        console.error("No document for this user.");
        setWorkspaces([]);
      }
    };

    if (!loading) {
      fetchUserWorkspaces();
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // The useEffect will handle redirection
  }

  return (
    <div>
      {workspaces.length > 0 ? (
        <div>
          <h2>Your Owned Workspaces:</h2>
          <ul>
            {ownedWorkspaces.map((workspace) => (
              <li key={workspace.id}>
                {workspace.name} (ID: {workspace.id})
              </li>
            ))}
          </ul>
          <h2>Your Collaborator Workspaces:</h2>
          <ul>
            {collaboratorWorkspaces.map((workspace) => (
              <li key={workspace.id}>
                {workspace.name} (ID: {workspace.id})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-background h-screen w-screen flex justify-center items-center">
          <DashboardSetup />
        </div>
      )}
      <div>
        <Button onClick={handleButtonClick}>Show Dashboard Setup</Button>
        {showDS && <DashboardSetup />}
      </div>
    </div>
  );
};

export default Dashboard;
