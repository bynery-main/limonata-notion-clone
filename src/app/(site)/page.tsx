"use client";

import { useRouter } from "next/navigation";
import HeroComponent from "@/components/landing-page/Hero/Hero";
import Intro from "@/components/landing-page/introduction-component";
import { TabsDemo } from "@/components/landing-page/landing-page-tabs";
import AIIntro from "@/components/landing-page/introducing-AI-component";
import CTA from "@/components/landing-page/CTA/CTA";
import Navbar from "@/components/landing-page/UI/NavBar/NavBar";
import UpgradeSection from "@/components/landing-page/Upgrade/UpgradeSection";
import ReadySection from "@/components/landing-page/Ready/ReadySection";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative">
      <Navbar />
      <HeroComponent />
      <UpgradeSection />
      <ReadySection />
      <div className="mx-auto">
        <AIIntro />
      </div>
      <section id="features-section" className="py-16">
        <div className="mt-8">
          <TabsDemo />
        </div>
      </section>
      <div className="mt-32 border-t-2 mx-8 py-14 px-5">
        {/* <FollowerPointerCard> */}
          <Intro />
        {/* </FollowerPointerCard> */}
      </div>

      <div>
        <CTA />
      </div>
    </div>
  );
}
