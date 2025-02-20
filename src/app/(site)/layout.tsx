"use client";

import Footer from "@/components/landing-page/UI/Footer/Footer";
import React from "react";

const HomePageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>


      {children}
      <Footer />
    </main>
  );
};

export default HomePageLayout;
