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

const AnimatedButton = styled(Button)`
  background: linear-gradient(-45deg, #fe7ef4, #f6b144);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  border: none;
  color: white;
  font-weight: normal;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
    <div className="relative flex items-center overflow-x-clip">
      <div className="flex items-center justify-center w-full">
        <RotatingCircle>
          <CircleGradients className="circle" />
        </RotatingCircle>
      </div>

      <div className="absolute top-[8vw] px-15 sm:px-6 md:px-8 lg:px-20 text-center md:text-left">
        <h1 className=" ">
          <FancyText
            gradient={{ from: "#FE7EF4", to: "#F6B144" }}
            className=" min-h-20 text-4xl sm:text-5xl md:text-6xl font-semibold text-black h-auto"
          >
            Study together.
          </FancyText>
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-black mb-6">
          Study smarter
        </h2>
        <div className="mt-4">
          {!isSignedIn ? (
            <AnimatedButton
              variant="default"
              onClick={login}
              className=" md:w-auto"
            >
              Start a Workspace
            </AnimatedButton>
          ) : (
            <AnimatedButton
              variant="default"
              onClick={goToDashboard}
              className=" md:w-auto"
            >
              Go to Your Dashboard
            </AnimatedButton>
          )}
        </div>
      </div>
    </div>
  );
}
