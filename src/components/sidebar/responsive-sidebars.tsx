import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MainSidebar } from "@/components/sidebar/main-sidebar";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { usePathname } from 'next/navigation';
import DashboardSetup from '@/components/dashboard-setup/dashboard-setup';
import { motion } from 'framer-motion'; // Import Framer Motion
import { IconArrowsLeft, IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { ArrowLeftCircleIcon, LucideSidebarClose, Menu, MoveLeftIcon, SidebarCloseIcon } from 'lucide-react';

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


  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const handleFoldersUpdate = useCallback((folders: Folder[]) => {
    if (onFoldersUpdate) {
      onFoldersUpdate(folders);
    }
  }, [onFoldersUpdate]);

  const memoizedMainSidebar = useMemo(() => (
    <MainSidebar
      user={user}
      setShowDashboardSetup={setShowDashboardSetup}
    />
  ), [user, setShowDashboardSetup]);


  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {memoizedMainSidebar}
      </div>

      {!isDashboardRoot && workspaceId && (
        <div
          className={`fixed inset-y-0 left-[50px] z-30 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <WorkspaceSidebar
            params={{ workspaceId: workspaceId }}
            onFoldersUpdate={handleFoldersUpdate}
          />
        </div>
      )}

      {/* Menu button for mobile */}
      {isMobile && (
        <motion.button
          className="fixed top-3 z-40 bg-gray-200 text-gray p-2 shadow-lgs rounded-md opacity-90 hover:opacity-100 transition-opacity"
          animate={{ left: isSidebarOpen ? 350 : 16 }} // Animate the left position
          transition={{ type: 'spring', stiffness: 100, damping: 20 }} // Spring animation
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <ArrowLeftCircleIcon className='h-4 w-4'/> : <Menu className='h-4 w-4'/>}
        </motion.button>
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
    </>
  );
}
export default ResponsiveSidebar;
