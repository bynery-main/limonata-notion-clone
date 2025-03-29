import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig"; // Adjust the path if necessary
import FancyText from "@carefully-coded/react-text-gradient";
import styled, { keyframes } from "styled-components";
import Image from 'next/image';
import './Hero.scss';
import { GradientButton } from '../UI/PrimaryButton/PrimaryButton';

const HeroContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow: hidden;
  background: white;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  text-align: center;
`;

const TextContent = styled.div`
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SocialProofContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;

  img {
    margin-right: -8px;
    border: 2px solid white;
    
    &:last-child {
      margin-right: 0;
    }
  }
`;

export default function HeroComponent() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const provider = new GoogleAuthProvider();

  const login = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <HeroContainer className="hero">
      <div className="hero__ray-overlay"></div>
      <ContentContainer>
        <TextContent>
          <SocialProofContainer>
            <AvatarGroup>
              {[1, 2, 3, 4].map((i) => (
                <Image
                  key={i}
                  src={`/avatars/avatar${i}.jpg`}
                  alt={`User ${i}`}
                  width={32}
                  height={32}
                  className="avatar"
                />
              ))}
            </AvatarGroup>
            <span className="social-proof__text">+20,000 students learn with us</span>
          </SocialProofContainer>

          <h1 className="hero__title">
            An AI-powered collaborative study platform built for the{' '}
            <FancyText
              gradient={{ from: "#F8F401", to: "#FC1AA6" }}
              className="inline"
            >
              top 1% students
            </FancyText>
          </h1>

          <h2 className="hero__subtitle">
            We help students create and organize ideas with AI
          </h2>

          <div className="hero__buttons">
            {!isSignedIn ? (
              <>
                <button 
                  onClick={login} 
                  className="p-[1px] relative block w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                  <div className="px-6 py-3 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center font-semibold">
                    Try it free
                  </div>
                </button>
                <button 
                  onClick={login}
                  className="p-[1px] relative block ml-0 sm:ml-4 mt-4 sm:mt-0 w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C66EC5] to-[#FC608D] rounded-full opacity-30" />
                  <div className="px-6 py-3 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-gray-800 flex items-center justify-center font-semibold border border-gray-200">
                    Login
                  </div>
                </button>
              </>
            ) : (
              <button 
                onClick={goToDashboard} 
                className="p-[1px] relative block w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                <div className="px-6 py-3 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center font-semibold">
                  Go to Dashboard
                </div>
              </button>
            )}
          </div>
        </TextContent>
      </ContentContainer>
    </HeroContainer>
  );
}
