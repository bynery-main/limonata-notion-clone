import React, { useState, useEffect } from 'react';
import { MainSidebar } from "@/components/sidebar/main-sidebar";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { usePathname } from 'next/navigation';
import DashboardSetup from '@/components/dashboard-setup/dashboard-setup';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftCircleIcon, Menu, X } from 'lucide-react';
import { PricingPage } from "@/components/subscribe/pricing";
import { GoProButton } from "@/components/subscribe/subscribe-button";
import NoCreditsModal from '../subscribe/no-credits-modal';

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
  const [showGoProModal, setShowGoProModal] = useState(false);
  const pathname = usePathname();
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [noCreditsModalData, setNoCreditsModalData] = useState({ remainingCredits: 0, creditCost: 0 });
  const isDashboardRoot = pathname === '/dashboard';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
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

  const handleGoProClick = () => {
    setShowGoProModal(true);
  };
  
  const handleShowNoCreditsModal = (remainingCredits: number, creditCost: number) => {
    setNoCreditsModalData({ remainingCredits, creditCost });
    setShowNoCreditsModal(true);
  };

  return (
    <div className="flex h-screen overflow-hidden z-100">
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
          className={`h-full ${
            isMobile ? 'fixed inset-y-0 left-[50px] z-30' : 'relative'
          } ${
            isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
          } transition-transform duration-300 ease-in-out flex`}
        >
          <WorkspaceSidebar
            params={{ workspaceId: workspaceId }}
            onFoldersUpdate={handleFoldersUpdate}
            onGoProClick={handleGoProClick}
            onShowNoCreditsModal={handleShowNoCreditsModal}
          />
        </div>
      )}

      {/* Menu button for mobile */}
      {isMobile && (
        <motion.button
          className="fixed top-3 z-40 bg-gray-200 text-gray p-2 shadow-lg rounded-md opacity-90 hover:opacity-100 transition-opacity"
          animate={{ left: isSidebarOpen ? 350 : 16 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
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

     {/* Go Pro Modal */}
     <AnimatePresence>
        {showGoProModal && (
          <motion.div 
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowGoProModal(false)} />
            
            {/* GoPro window */}
            <motion.div 
              className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                onClick={() => setShowGoProModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <div className="p-8">
                <PricingPage />
                <div className="flex justify-center items-center mt-8">
                  <GoProButton
                    className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                    userEmail={user.email}
                    userId={user.uid}
                    subscriptionStatus={user.subscriptionStatus}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
       {/* No Credits Modal */}
       <AnimatePresence>
        {showNoCreditsModal && (
          <motion.div 
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowNoCreditsModal(false)} />
            
            <motion.div 
              className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                onClick={() => setShowNoCreditsModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <div className="p-8">
                <NoCreditsModal
                  remainingCredits={noCreditsModalData.remainingCredits}
                  creditCost={noCreditsModalData.creditCost}
                  onClose={() => setShowNoCreditsModal(false)}
                  userId={user.uid}
                  userEmail={user.email}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResponsiveSidebar;