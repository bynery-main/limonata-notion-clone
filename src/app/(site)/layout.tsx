"use client";

import Footer from "@/components/footer/footer";
import React from "react";

const HomePageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>


      {children}
      <Footer />
    </main>
  );
};

export default HomePageLayout;
