"use client";

import { useRouter } from "next/navigation";
import HeroComponent from "@/components/landing-page/Hero-component";
import Intro from "@/components/landing-page/introduction-component";
import { TabsDemo } from "@/components/landing-page/landing-page-tabs";
// import { FollowerPointerCard } from "@/components/ui/following-pointer";
import AIIntro from "@/components/landing-page/introducing-AI-component";
import CTA from "@/components/landing-page/CTA-component";

export default function Home() {
  const router = useRouter();

  return (
    <div className="items-center justify-center mt-[9vw]">

      <div className="mt-[7vw] min-h-[40vw]">
        <HeroComponent />
      </div>


      <div className="mx-8 border-t-2 mt-4 border-b-2">
        <AIIntro />
      </div>

      <div className="mt-8">
        <TabsDemo />
      </div>

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
