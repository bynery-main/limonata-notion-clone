"use client";

import { useRouter } from "next/navigation";
import { auth } from "../../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

export default function Home() {

  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem('user');

  if (!user && !userSession) {
    return router.push('/login');
  }

  return (
    <>
      <div>
        <div>
          Home
        </div>
        <div>
          <button onClick={() => {
            signOut(auth)
            sessionStorage.removeItem('user');
          }}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
