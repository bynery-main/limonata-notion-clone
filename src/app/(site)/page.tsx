"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import LandingPageComponent from "@/components/landing-page/landing-page-component";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import Navbar from "@/components/landing-page/navbar";
import {TabsDemo} from "@/components/landing-page/landing-page-tabs";
import Image from "next/image";



export default function Home() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut(auth);
    router.push('/login');
  };

  return (
    <>
      <Navbar />
      <LandingPageComponent/>
      <div className="flex mx-20">

      <TabsDemo/>
      </div>
    </>
  );
}