import FancyText from '@carefully-coded/react-text-gradient';
import { Button } from "@/components/ui/button";
import styled, { keyframes } from 'styled-components';
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

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

export default function CTAComponent() {

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
    <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 my-16 sm:my-30 md:my-40 lg:my-50 mx-auto max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-black">
        Make{' '}
        <FancyText 
          gradient={{ from: '#F6B144', to: '#FE7EF4' }}
          className="font-extrabold"
        >
          AI
        </FancyText>
        {' '}be at the service of your learning.
      </h2> 
      <div className=" mt-7 space-y-4 md:space-y-0 md:space-x-4 ">

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
      <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-3">
        Yes. It&apos;s free.
      </p>
    </div>
  );
}