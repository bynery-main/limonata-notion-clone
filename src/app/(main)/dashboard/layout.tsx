"use client";

import React, { useEffect, useMemo } from "react";
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

  const workspaceId = useMemo(() => {
    const match = pathname?.match(/^\/dashboard\/([^\/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ResponsiveSidebar user={user} workspaceId={workspaceId} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;