"use client";

import { MainSidebar } from "@/components/sidebar/main-sidebar";
import React, { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';

const AnimatedChildren: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500); // Match this to your animation duration
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`w-full ${isAnimating ? 'slide-top' : ''}`}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <main className="flex overflow-hidden h-screen">
      <MainSidebar />
      <AnimatedChildren>{children}</AnimatedChildren>
    </main>
  );
};

export default Layout;