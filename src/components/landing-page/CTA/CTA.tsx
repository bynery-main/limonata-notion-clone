import React, { useEffect, useState } from "react";
import { auth } from "../../../firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import CTA from '../../../../public/images/CTA/cta.png';
import Image from 'next/image';
import './CTA.scss';
import { GradientButton } from '../UI/PrimaryButton/PrimaryButton';

export default function CTAComponent() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => setIsSignedIn(!!user)
    );
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (isSignedIn) {
      router.push("/dashboard");
      return;
    }

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="cta-container">
      <div className="background-container">
        <Image
          src={CTA}
          alt="CTA background"
          fill
          priority
          quality={100}
        />
      </div>

      <div className="content-overlay">
        <div className="content-wrapper">
          <h2>
            Study with your own AI Professor.
          </h2> 
          <div className="button-container">
            <GradientButton onClick={handleAuth}>
              {isSignedIn ? 'Go to Your Dashboard' : 'Start a Workspace'}
            </GradientButton>
          </div>
          <p className="free-text">
            Yes. It&apos;s free.
          </p>
        </div>
      </div>
    </div>
  );
}