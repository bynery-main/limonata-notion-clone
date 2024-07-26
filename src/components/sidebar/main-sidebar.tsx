"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { fetchWorkspaces, Workspace } from "@/lib/db/workspaces/get-workspaces";
import { useRouter } from "next/navigation";
import { FaPlus, FaCog } from "react-icons/fa";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import Link from "next/link";

export const MainSidebar = (): JSX.Element => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const router = useRouter();
  const [showDS, setShowDS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadWorkspaces = async () => {
      if (user) {
        const owned = await fetchWorkspaces("owners", user.uid);
        const collaborated = await fetchWorkspaces("collaborators", user.uid);
        setWorkspaces([...owned, ...collaborated]);
      }
    };

    loadWorkspaces();
  }, [user]);

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/dashboard/${workspaceId}`);
  };

  const handleCancel = () => {
    setShowDS(false);
  };

  const handleSuccess = () => {
    // Add your success handling logic here
    setShowDS(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      setShowSettings(false);
    }
  };

  return (
    <div className="relative w-14 h-screen bg-[#010256] flex flex-col justify-between">
      <div className="bg-[#010256] flex flex-col items-center">
        <button className="mt-3 w-[34px] h-[34px] bg-[#020039] rounded-md overflow-hidden shadow-[0px_0px_0px_2px_#b4cfff]" onClick={() => router.push("/dashboard")}>
          <div className="w-[34px] h-[34px] rounded-md overflow-hidden border border-solid border-[#0000001a] bg-cover bg-[50%_50%]">
            <img
              className="w-[34px] h-[34px] object-cover"
              alt="Rectangle"
              src="/mnt/data/image.png"
            />
          </div>
        </button>
        {workspaces.map((workspace, index) => (
          <WorkspaceIcon 
            key={workspace.id} 
            workspace={workspace} 
            index={index} 
            onClick={() => handleWorkspaceClick(workspace.id)}
          />
        ))}
        <div 
          className="mt-4 w-10 h-10 bg-[#020039] rounded-md overflow-hidden cursor-pointer flex items-center justify-center text-white text-2xl"
          onClick={() => setShowDS(true)}
        >
          <FaPlus color="#00bfff" /> {/* Light blue color */}
        </div>
      </div>
      <div className="flex flex-col items-center pb-4">
        <img className="w-6 h-6" alt="Frame" src="frame-2.svg" />
        <div className="w-6 h-6 bg-[#ff6d00] rounded-full overflow-hidden cursor-pointer mt-2" onClick={() => setShowSettings(!showSettings)}>
          <div className="w-[18px] h-3 mt-2 mx-auto font-bold text-[#4c2103] text-[10px] text-center leading-3">
            MG
          </div>
        </div>
        {showSettings && (
          <div className="absolute bottom-0 left-16 z-50" onClick={handleOverlayClick}>
            <div className="relative w-32 bg-white rounded-lg shadow-lg p-2 mb-2">
              <Link href="/settings" passHref>
                <div className="text-black px-4 py-2 hover:bg-gray-200 rounded-md cursor-pointer flex items-center">
                  <FaCog className="mr-2" /> Settings
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
      {showDS && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <DashboardSetup onCancel={handleCancel} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
};

interface WorkspaceIconProps {
  workspace: Workspace;
  index: number;
  onClick: () => void;
}

const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ workspace, index, onClick }) => {
  return (
    <div 
      className="mt-4 w-10 h-10 bg-[#020039] rounded-md overflow-hidden cursor-pointer flex items-center justify-center text-white font-bold text-lg"
      onClick={onClick}
    >
      {workspace.name.charAt(0).toUpperCase()}
    </div>
  );
};
