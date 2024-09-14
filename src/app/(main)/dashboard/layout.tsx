"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import ResponsiveSidebar from "@/components/sidebar/responsive-sidebars";
import { MainSidebar } from "@/components/sidebar/main-sidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  console.log('Layout user', user);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if no user
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Return null while loading or redirecting
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ResponsiveSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;