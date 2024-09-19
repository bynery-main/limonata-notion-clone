"use client";

import Footer from "@/components/footer/footer";
import Navbar from "@/components/landing-page/navbar";
import React from "react";

const HomePageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <div className="max-h-[10vw]">
        <Navbar />
      </div>

      {children}
      <Footer />
    </main>
  );
};

export default HomePageLayout;
