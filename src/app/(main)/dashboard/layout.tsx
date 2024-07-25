import { MainSidebar } from "@/components/sidebar/main-sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  return (
    <main className="flex over-hidden h-screen">
      <MainSidebar />
      {children}
    </main>
  );
};

export default Layout;
