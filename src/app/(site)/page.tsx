"use client";

import { useRouter } from "next/navigation";
import HeroComponent from "@/components/landing-page/Hero/Hero";

import CTA from "@/components/landing-page/CTA/CTA";
import Navbar from "@/components/landing-page/UI/NavBar/NavBar";
import UpgradeSection from "@/components/landing-page/Upgrade/UpgradeSection";
import ReadySection from "@/components/landing-page/Ready/ReadySection";
import Reviews from "@/components/landing-page/Reviews/Reviews";
export default function Home() {
  const router = useRouter();

  return (
    <div className="relative">
      <Navbar />
      <HeroComponent />
      <UpgradeSection />
      <ReadySection />
      <Reviews />
      

      <div>
        <CTA />
      </div>
    </div>
  );
}
