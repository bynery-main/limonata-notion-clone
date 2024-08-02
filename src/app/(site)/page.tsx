"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import LandingPageComponent from "@/components/landing-page/landing-page-component";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import Navbar from "@/components/landing-page/navbar";

export default function Home() {
  // const { user, loading } = useAuth();
  const router = useRouter();

  // console.log(user)

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  const handleSignOut = () => {
    signOut(auth);
    router.push('/login');
  };

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (!user) {
  //   return null; // The useEffect will handle redirection
  // }

  return (
    <>
      <Navbar />
      <LandingPageComponent />
    </>
  );
}