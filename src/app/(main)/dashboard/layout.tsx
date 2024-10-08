"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import ResponsiveSidebar from "@/components/sidebar/responsive-sidebars";
import { MainSidebar } from "@/components/sidebar/main-sidebar";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isPhone, setIsPhone] = useState(false);
  const [showDashboardSetup, setShowDashboardSetup] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkIfPhone = () => {
      setIsPhone(window.innerWidth < 768); // Assuming 768px as the breakpoint for phones
    };

    checkIfPhone();
    window.addEventListener('resize', checkIfPhone);

    return () => window.removeEventListener('resize', checkIfPhone);
  }, []);

  if (loading || !user) {
    return null;
  }
  
  const isRootDashboard = pathname === '/dashboard';

  const handleDashboardSetupSuccess = () => {
    setShowDashboardSetup(false);
    // You might want to add additional logic here, such as refreshing the workspace list
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {isPhone ? 
        isRootDashboard ? <ResponsiveSidebar user={user} /> : null 
        : <MainSidebar user={user} setShowDashboardSetup={setShowDashboardSetup} />
      }
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {showDashboardSetup && (
        <DashboardSetup
          onCancel={() => setShowDashboardSetup(false)}
          onSuccess={handleDashboardSetupSuccess}
        />
      )}
    </div>
  );
};

export default Layout;