import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <main className="flex w-full h-full">
      <WorkspaceSidebar params={params} />
      <div
        className="dark:boder-Neutrals-12/70
        border-l-[1px]
        w-full
        relative
        overflow-scroll
      "
      >
        {children}
      </div>
    </main>
  );
};

export default Layout;
