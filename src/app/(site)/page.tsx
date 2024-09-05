"use client";

import { useRouter } from "next/navigation";
import HeroComponent from "@/components/landing-page/Hero-component";
import Intro from "@/components/landing-page/introduction-component";
import { TabsDemo } from "@/components/landing-page/landing-page-tabs";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import AIIntro from "@/components/landing-page/introducing-AI-component";
import CTA from "@/components/landing-page/CTA-component";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <div className="mt-[7vw] min-h-[45vw]">
        <HeroComponent />
      </div>

      <FollowerPointerCard>
        <Intro />
      </FollowerPointerCard>
      <AIIntro />
      <TabsDemo />
      <CTA />
    </>
  );
}
