"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { fetchWorkspaces, Workspace } from "@/lib/db/workspaces/get-workspaces";
import { useRouter } from "next/navigation";
import { FaPlus, FaCog } from "react-icons/fa";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import Link from "next/link";
import { Home } from 'lucide-react';

export const MainSidebar = (): JSX.Element => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const router = useRouter();
  const [showDS, setShowDS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);

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

    if (workspaceId === 'home') {
      setActiveIcon('home');
      router.push("/dashboard")
    }
    else {
      router.push(`/dashboard/${workspaceId}`);
    }
    setActiveIcon(workspaceId);
    console.log('Icon clicked:', workspaceId);
    return;

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
      <div className=" mt-3 bg-[#010256] flex flex-col items-center">
       
        <button className="w-[34px] h-[34px] bg-[#020039] rounded-md " onClick={() =>  handleWorkspaceClick('home')}>
          <div className="flex items-center justify-center w-[34px] h-[34px] rounded-md overflow-hidden  bg-cover bg-[50%_50%] hover:border-2 hover:border-[#6FA2FF]">
          <Home className=" w-5 h-5 text-[#6FA2FF]" />
          </div>
        </button>
        {workspaces.map((workspace, index) => (
          <WorkspaceIcon 
            key={workspace.id} 
            isActive={activeIcon === workspace.id}
            workspace={workspace} 
            index={index} 
            onClick={() => handleWorkspaceClick(workspace.id)}
          />
        ))}
        <div 
          className="mt-4 w-10 h-10 bg-[#020039] rounded-md overflow-hidden cursor-pointer flex items-center justify-center text-white text-md hover:text-[#FF5924] hover:border-2 hover:border-[#FF5924]"
          onClick={() => setShowDS(true)}
        >
          <FaPlus className="" /> {/* Light blue color */}
        </div>
      </div>
      <div className="flex flex-col items-center pb-4">
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
        <div className="absolute top-0 left-0 w-full h-full bg-[#6FA2FF] bg-opacity-50 flex items-center justify-center">
          <DashboardSetup onCancel={handleCancel} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
};

interface WorkspaceIconProps {
  isActive: boolean;
  workspace: Workspace;
  index: number;
  onClick: () => void;
}

const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ workspace, index, onClick, isActive }) => {
  return (
    <div 
    className={`mt-4 w-10 h-10 bg-[#020039] rounded-md overflow-hidden cursor-pointer flex items-center justify-center text-[#6FA2FF] font-semibold text-md hover:border-2 hover:border-[#6FA2FF] ${isActive ? 'border-2 border-[#6FA2FF]' : ''}`}
    onClick={onClick}
    >
      {workspace.name.charAt(0).toUpperCase()}
    </div>
  );
};
