import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary
import CircleGradients from "./Circle-Gradients.svg";
import FancyText from "@carefully-coded/react-text-gradient";
import { RotatingCircle } from "./rotating-circle";
import styled, { keyframes } from "styled-components";
import Image from 'next/image';


const gradientAnimation = keyframes`
  0% {
      background-position: 0% 50%;
  }
  50% {
      background-position: 100% 50%;
  }
  100% {
      background-position: 0% 50%;
  }
`;

const SocialProofContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.75rem;

  img {
    border: 2px solid white;
    border-radius: 50%;
    margin-left: -0.75rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    &:first-child {
      margin-left: 0;
    }
  }
`;

const HeroContainer = styled.div`
  position: relative;
  display: flex;
  min-height: calc(100vh - 100px);
  width: 100%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 1rem;
`;

const ContentContainer = styled.div`
  position: relative;
  max-width: 1200px;
  width: 100%;
  z-index: 10;
  display: flex;
  justify-content: center;
`;

const TextContent = styled.div`
  max-width: 720px;
  text-align: center;
  
  @media (min-width: 768px) {
    text-align: left;
  }
`;

const GradientButton = styled(Button)`
  min-width: 160px;
  height: 48px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(-45deg, #FE7EF4, #F6B144);
  background-size: 200% 200%;
  animation: ${gradientAnimation} 15s ease infinite;
  color: white;
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0px);
  }
`;

const OutlineButton = styled(Button)`
  min-width: 160px;
  height: 48px;
  font-weight: 500;
  border-radius: 8px;
  background: transparent;
  color: #333;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
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
    <HeroContainer>
      <div className="absolute right-0 w-[50vw] h-full">
        <RotatingCircle>
          <CircleGradients className="circle" />
        </RotatingCircle>
      </div>

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
                  className="w-8 h-8 rounded-full object-cover"
                />
              ))}
            </AvatarGroup>
            <span className="text-sm text-gray-600 font-medium">+20,000 students trust us</span>
          </SocialProofContainer>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            An AI-powered collaborative study platform built for the{' '}
            <FancyText
              gradient={{ from: "#FE7EF4", to: "#F6B144" }}
              className="inline"
            >
              top 1% students
            </FancyText>
          </h1>

          <h2 className="text-xl sm:text-2xl text-gray-600 mb-10 font-normal">
            We help students create and organize ideas with AI
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            {!isSignedIn ? (
              <>
                <GradientButton
                  onClick={login}
                  className="shadow-md"
                >
                  Try it free
                </GradientButton>
                <OutlineButton
                  onClick={login}
                >
                  Login
                </OutlineButton>
              </>
            ) : (
              <GradientButton
                onClick={goToDashboard}
                className="shadow-md"
              >
                Go to Dashboard
              </GradientButton>
            )}
          </div>
        </TextContent>
      </ContentContainer>
    </HeroContainer>
  );
}
