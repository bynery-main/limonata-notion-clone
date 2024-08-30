import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary
import CircleGradients from "./Circle-Gradients.svg";
import styled, { keyframes } from 'styled-components';

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

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const AnimatedButton = styled(Button)`
  background: linear-gradient(-45deg, #FE7EF4, #F6B144);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  border: none;
  color: white;
  font-weight: bold;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const RotatingCircle = styled.div`
  animation: ${rotateAnimation} 30s linear infinite;
  position: absolute;
  left: -100px;
  top: -200px;
  
  @media (max-width: 768px) {
    left: -150px;
    top: -250px;
    transform: scale(0.7);
  }
  
  @media (max-width: 480px) {
    left: -200px;
    top: -300px;
    transform: scale(0.5);
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
    <div className="relative min-h-[500px] ">
      <RotatingCircle>
        <CircleGradients className="circle" />
      </RotatingCircle>
      <div className="absolute top-1/4 left-0 right-0 px-4 sm:px-6 md:px-8 lg:px-16 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-2">
          Study together.
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-black mb-6">
          Study smarter
        </h2>
        <div className="space-y-4 md:space-y-0 md:space-x-4 ">
          {!isSignedIn ? (
            <AnimatedButton variant="default" onClick={login} className=" md:w-auto">
              Start a Workspace
            </AnimatedButton>
          ) : (
            <AnimatedButton variant="default" onClick={goToDashboard} className=" md:w-auto">
              Go to Your Dashboard
            </AnimatedButton>
          )}
        </div>
      </div>
    </div>
  );
}