"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { fetchWorkspaces, Workspace } from "@/lib/db/workspaces/get-workspaces";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
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

  return (
    <div className="relative w-14 h-[810px] bg-[#010256]">
      <div className="top-0 bg-[#010256] inline-flex items-start absolute left-0">
        <div className="inline-flex items-start pt-0 pb-12 px-0 relative flex-[0_0_auto]">
          <div className="relative w-14">
            <div className="relative h-[106px] top-[7px]">
              <button className="absolute w-[34px] h-[34px] top-3 left-[11px] bg-[#020039] rounded-md overflow-hidden shadow-[0px_0px_0px_2px_#b4cfff]" onClick={() => router.push("/dashboard")}>
                <div className="relative h-[34px] rounded-md overflow-hidden border border-solid border-[#0000001a] bg-cover bg-[50%_50%]">
                  <img
                    className="w-[34px] h-[34px] top-0 object-cover absolute left-0"
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
                className="absolute w-10 h-10 left-2 rounded-md overflow-hidden cursor-pointer bg-[#020039] flex items-center justify-center text-white text-2xl"
                style={{ top: `${60 + workspaces.length * 44}px` }}
                onClick={() => setShowDS(true)}
              >
                <FaPlus color="#00bfff" /> {/* Light blue color */}
              </div>
            </div>
          </div>
          <div className="w-14 h-[70px] top-[406px] [background:linear-gradient(180deg,rgba(1,2,86,0)_0%,rgb(1,2,86)_100%)] absolute left-0" />
        </div>
      </div>
      <div className="flex-col justify-end gap-5 pt-2 pb-4 px-4 top-[718px] inline-flex items-start absolute left-0">
        <img className="relative w-6 h-6" alt="Frame" src="frame-2.svg" />
        <div className="relative w-6 h-6 bg-[#ff6d00] rounded-[999px] overflow-hidden cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
          <div className="absolute w-[18px] h-3 top-[5px] left-[3px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#4c2103] text-[10px] text-center tracking-[0.40px] leading-3 whitespace-nowrap">
            MG
          </div>
        </div>
        {showSettings && (
          <div className="absolute left-10 bottom-10 w-32 bg-white rounded-lg shadow-lg p-2">
            <Link href="/settings" passHref>
              <div className="block text-black px-4 py-2 hover:bg-gray-200 rounded-md cursor-pointer">
                Settings
              </div>
            </Link>
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
      className="absolute w-10 h-10 left-2 rounded-md overflow-hidden cursor-pointer"
      style={{ top: `${60 + index * 44}px` }}
      onClick={onClick}
    >
      <div className="w-full h-full flex items-center justify-center bg-[#020039] text-white font-bold text-lg">
        {workspace.name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
};
