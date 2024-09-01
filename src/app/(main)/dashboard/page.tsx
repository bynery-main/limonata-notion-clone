"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { fetchWorkspaces, Workspace } from "@/lib/db/workspaces/get-workspaces";
import ExpandableCardDemo from "@/components/blocks/expandable-card-demo-standard";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [collaboratorWorkspaces, setCollaboratorWorkspaces] = useState<Workspace[]>([]);
  const [showDashboardSetup, setShowDashboardSetup] = useState(false);

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

  const handleCancel = () => {
    setShowDashboardSetup(false);
  };

  const handleSuccess = async () => {
    setShowDashboardSetup(false);
    if (user) {
      const owned = await fetchWorkspaces("owners", user.uid);
      const collaborated = await fetchWorkspaces("collaborators", user.uid);
      setOwnedWorkspaces(owned);
      setCollaboratorWorkspaces(collaborated);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const cards = [
    ...ownedWorkspaces.map(workspace => ({ ...workspace, type: "Owned" })),
    ...collaboratorWorkspaces.map(workspace => ({ ...workspace, type: "Collaborator" }))
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {cards.length > 0 ? (
        <ExpandableCardDemo cards={cards} />
      ) : (
        <div className="h-screen flex justify-center items-center">
          <button
            onClick={() => setShowDashboardSetup(true)}
            className="bg-[#ff5924] text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-[#e54e1f] transition-colors"
          >
            Create Workspace
          </button>
        </div>
      )}
      {showDashboardSetup && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center" onClick={handleOverlayClick}>
          <DashboardSetup onCancel={handleCancel} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;