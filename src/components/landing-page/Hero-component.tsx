import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary
import CircleGradients from "./Circle-Gradients.svg";
import styled, { keyframes } from 'styled-components';

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

  return (
    <div style={{ position: "relative", textAlign: "left", height: "500px" }}>
      <CircleGradients
        className="circle"
        style={{ position: "absolute", left: "-100px", top: "-200px" }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          marginLeft: "175px",
          color: "black",
          fontSize: "60px",
          fontWeight: "bold",
        }}
      >
        <div style={{ fontWeight: "bold" }}>Study together.</div>
        <div style={{ fontWeight: "lighter" }}>Study smarter</div>
        <div className="space-x-4">
          {!isSignedIn ? (
            <AnimatedButton variant="default" onClick={login}>
              Start a Workspace
            </AnimatedButton>
          ) : (
            <AnimatedButton variant="default" onClick={goToDashboard}>
              Go to Your Dashboard
            </AnimatedButton>
          )}
        </div>
      </div>
    </div>
  );
}