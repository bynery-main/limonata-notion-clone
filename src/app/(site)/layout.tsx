"use client";

import Footer from "@/components/footer/footer";
import React, { useState, useEffect } from "react";

const HomePageLayout = ({ children }: { children: React.ReactNode }) => {
  const [platform, setPlatform] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const updatePlatform = () => {
      setPlatform(window.innerWidth <= 768 ? "mobile" : "desktop");
    };

    window.addEventListener("resize", updatePlatform);
    updatePlatform(); 

    return () => window.removeEventListener("resize", updatePlatform);
  }, []);

  return (
    <main>
      {/* <Header /> */}
      {children}
      <Footer platform={platform} />
    </main>
  );
};

export default HomePageLayout;
