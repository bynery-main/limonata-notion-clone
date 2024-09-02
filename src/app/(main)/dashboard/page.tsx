"use client";

import Footer from "@/components/footer/footer";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth-provider/AuthProvider';
import { fetchWorkspaces, Workspace } from "@/lib/db/workspaces/get-workspaces";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import ExpandableCardDemo from "@/components/blocks/expandable-card-demo-standard";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import FancyText from '@carefully-coded/react-text-gradient';

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

  const handleAddWorkspace = () => {
    setShowDashboardSetup(true);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const allWorkspaces = [
    ...ownedWorkspaces.map(w => ({ ...w, type: 'Owned' as const })),
    ...collaboratorWorkspaces.map(w => ({ ...w, type: 'Collaborator' as const }))
  ];

  return (
    <div className="p-4 md:p-8 lg:p-20 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
          <FancyText gradient={{ from: '#FE7EF4', to: '#F6B144' }} className=" min-h-20 text-4xl sm:text-5xl md:text-6xl font-bold text-black font-extrabold h-auto">
            Workspaces
            </FancyText>
            </h1>
          <p className="text-gray-600">
            Here you&apos;ll find the list of all your workspaces,<br />
            some of them are private and others are shared.
          </p>  
        </div>
        
        <div className="w-full">
          {allWorkspaces.length > 0 ? (
            <ExpandableCardDemo cards={allWorkspaces} onAddWorkspace={handleAddWorkspace} />
          ) : (
          <div className="h-[50vh] flex justify-center items-center">
            <button 
              onClick={() => setShowDashboardSetup(true)}
              className="p-[3px] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
              <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white">
                Create Workspace
              </div>
            </button>
          </div>
        )}
      </div>
      </div>
      {showDashboardSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={handleOverlayClick}>
          <DashboardSetup onCancel={handleCancel} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;