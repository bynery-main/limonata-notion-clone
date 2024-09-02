"use client";

import { MainSidebar } from "@/components/sidebar/main-sidebar";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";

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
      <MainSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;