import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary
import CircleGradients from "./Circle-Gradients.svg";

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
            <Button variant="default" onClick={login}>
              Start a Class
            </Button>
          ) : (
            <Button variant="default" onClick={goToDashboard}>
              Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}