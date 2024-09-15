import React, { useState, useEffect } from 'react';
import { MainSidebar } from "@/components/sidebar/main-sidebar";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { usePathname } from 'next/navigation';
import DashboardSetup from '@/components/dashboard-setup/dashboard-setup';

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}

interface ResponsiveSidebarProps {
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
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true); // Ensure sidebars are open on larger screens
      } else {
        setIsSidebarOpen(false); // Ensure sidebars are closed on smaller screens
      }
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
    <div className="flex h-screen overflow-hidden"> {/* Ensure parent takes full screen height and hides overflow */}
      {/* Main Sidebar */}
      <div
        className={`h-full ${
          isMobile ? 'fixed inset-y-0 left-0 z-20' : 'relative'
        } ${
          isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
        } transition-transform duration-300 ease-in-out`}
      >
        <MainSidebar
          user={user}
          setShowDashboardSetup={setShowDashboardSetup}
        />
      </div>

      {/* Workspace Sidebar */}
      {!isDashboardRoot && workspaceId && (!isMobile || isSidebarOpen) && (
        <div
          className={`h-screen ${ // Ensuring it takes full screen height
            isMobile ? 'fixed inset-y-0 left-[50px] z-30' : 'relative'
          } ${
            isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
          } transition-transform duration-300 ease-in-out flex`}
        >
          <WorkspaceSidebar
            params={{ workspaceId: workspaceId }}
            onFoldersUpdate={handleFoldersUpdate}
          />
        </div>
      )}

      {/* Menu button for mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-40 bg-gray-800 text-white p-2 rounded-md"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
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
    </div>
  );
};

export default ResponsiveSidebar;
