import React, { useState, useEffect } from 'react';
import { MainSidebar } from "@/components/sidebar/main-sidebar";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { usePathname } from 'next/navigation';
import DashboardSetup from '@/components/dashboard-setup/dashboard-setup'; // Adjust the import path as needed

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}interface ResponsiveSidebarProps {
  user: any;
  workspaceId?: string;
  onFoldersUpdate?: (newFoldersData: Folder[]) => void;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ user, workspaceId, onFoldersUpdate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDashboardSetup, setShowDashboardSetup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const isDashboardRoot = pathname === '/dashboard';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFoldersUpdate = (folders: Folder[]) => {
    if (onFoldersUpdate) {
      onFoldersUpdate(folders);
    } else {
      console.log('Folders updated:', folders);
    }
  };

  return (
    <>
      {/* Menu button for mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Sidebars */}
      <div className={`h-full ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'} flex`}>
        <div className={`flex ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'} transition-transform duration-200 ease-in-out`}>
          <MainSidebar 
            user={user}
            setShowDashboardSetup={setShowDashboardSetup}
          />
          {!isDashboardRoot && workspaceId && (
            <WorkspaceSidebar 
              params={{ workspaceId: workspaceId }}
              onFoldersUpdate={handleFoldersUpdate}
            />
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* DashboardSetup Modal */}
      {showDashboardSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <DashboardSetup
              onCancel={() => setShowDashboardSetup(false)}
              onSuccess={() => setShowDashboardSetup(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveSidebar;