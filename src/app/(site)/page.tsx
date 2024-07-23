"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingPageComponent from "@/components/landing-page-component";
// import { GoogleAuthProvider } from "firebase/auth/cordova";

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [userSession, setUserSession] = useState<string | null>(null);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      setUserSession(sessionUser);
    } else if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSignOut = () => {
    signOut(auth);
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const provider = new GoogleAuthProvider();
  const login = () => {
    signInWithPopup(auth, provider)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <>
    <LandingPageComponent />
        
    </>
  );

}
