"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import HeroComponent from "@/components/landing-page/Hero-component";
import Intro from "@/components/landing-page/introduction-component";
import Navbar from "@/components/landing-page/navbar";
import {TabsDemo} from "@/components/landing-page/landing-page-tabs";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import AIIntro from "@/components/landing-page/introducing-AI-component";
import CTA from "@/components/landing-page/CTA-component";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar/>
      <HeroComponent/>
      <FollowerPointerCard>
        <Intro/>
      </FollowerPointerCard>
      <AIIntro/>
      <TabsDemo/>
      <CTA/>

    </>
  );
}