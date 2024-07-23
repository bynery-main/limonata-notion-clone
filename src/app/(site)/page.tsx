"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

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

  return (
    <>
      <div>
        <div>
          Home
        </div>
        <div>
          <button onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
