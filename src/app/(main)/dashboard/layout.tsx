"use client";

import { MainSidebar } from "@/components/sidebar/main-sidebar";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  const router = useRouter();
  const user = useAuth();

  console.log('Layout user', user);

  useEffect(() => {
    if (!user) {
      router.push('/login'); // Redirect to login if no user
    }
  }, [user, router]);

  if (!user) {
    return null; // Return null while redirecting
  }

  return (
    <main className="flex overflow-hidden h-screen">
      <MainSidebar />
      {children}
    </main>
  );
};

export default Layout;