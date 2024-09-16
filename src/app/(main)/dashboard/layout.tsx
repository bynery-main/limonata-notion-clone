"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import ResponsiveSidebar from "@/components/sidebar/responsive-sidebars";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }
  
  const isRootDashboard = pathname === '/dashboard';
  return (
  <div className="flex h-screen overflow-hidden">
       {isRootDashboard && <ResponsiveSidebar user={user} />}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;