"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import ResponsiveSidebar from "@/components/sidebar/responsive-sidebars";
import { MainSidebar } from "@/components/sidebar/main-sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isPhone, setIsPhone] = useState(false);

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

  return (
    <div className="flex h-screen overflow-hidden">
      {isPhone ? 
        isRootDashboard ? <ResponsiveSidebar user={user} /> : null 
        : <MainSidebar user={user} setShowDashboardSetup={function (show: boolean): void {
          throw new Error("Function not implemented.");
        } } />
      }
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;