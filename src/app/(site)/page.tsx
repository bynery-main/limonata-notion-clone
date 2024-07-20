"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";

export default function Home() {
  const provider = new GoogleAuthProvider();
  const login = () => {
    const result = signInWithPopup(auth, provider);
    console.log(result);
  }

  return (
    <>
      <button onClick={login} className="btn btn-primary">
        Click me
      </button>
    </>
  );
}
