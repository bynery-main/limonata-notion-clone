import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary
import FancyText from "@carefully-coded/react-text-gradient";
import styled, { keyframes } from "styled-components";
import Image from 'next/image';

const HeroContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
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

const GradientButton = styled.button`
  background: linear-gradient(to right, #FE7EF4, #F6B144);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const OutlineButton = styled.button`
  background: transparent;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: 2px solid #E5E7EB;
  transition: all 0.2s ease;

  &:hover {
    background: #F3F4F6;
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
            <span className="text-sm text-gray-600 font-medium">+20,000 students learn with us</span>
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
