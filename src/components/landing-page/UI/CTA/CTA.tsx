import FancyText from '@carefully-coded/react-text-gradient';
import { Button } from "@/components/ui/button";
import styled, { keyframes } from 'styled-components';
import React, { useEffect, useState } from "react";
import { auth } from "../../../../firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import CTA from '../../../../../public/images/CTA/cta.png';
import Image from 'next/image';
import './CTA.scss';
import { GradientButton } from '../PrimaryButton/PrimaryButton';

const gradientAnimation = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const AnimatedButton = styled(Button)`
  background: linear-gradient(-45deg, #FE7EF4, #F6B144);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  border: none;
  color: white;
  font-weight: bold;
  
  &:hover { opacity: 0.9; }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

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
            Study with your own{' '}
            <FancyText 
              gradient={{ from: '#F6B144', to: '#FE7EF4' }}
              className="font-extrabold"
            >
              AI
            </FancyText>
            {' '}Professor.
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