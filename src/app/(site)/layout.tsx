"use client";

import Footer from "@/components/footer/footer";
import React from "react";

const HomePageLayout = ({ children }: { children: React.ReactNode }) => {


  return (
    <main>
      {/* <Header /> */}
      {children}
      <Footer  />
    </main>
  );
};

export default HomePageLayout;
