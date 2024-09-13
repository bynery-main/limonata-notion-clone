"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import FancyText from '@carefully-coded/react-text-gradient';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const provider = new GoogleAuthProvider();
  const [rotation, setRotation] = useState(0);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (logoRef.current) {
        const logo = logoRef.current;
        const rect = logo.getBoundingClientRect();
        const logoX = rect.left + rect.width / 2;
        const logoY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - logoX;
        const deltaY = e.clientY - logoY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Max distance for effect (adjust as needed)
        const maxDistance = 200;
        
        // Calculate rotation speed based on distance
        const speed = Math.max(0, (maxDistance - distance) / maxDistance);
        setRotation(prevRotation => prevRotation + speed * 5);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (user) {
    router.push("/dashboard");
  }

  const handleSignInWithGoogle = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
        <FancyText gradient={{ from: '#FE7EF4', to: '#F6B144' }} className="min-h-10 text-3xl sm:text-4xl md:text-5xl font-bold text-black font-extrabold h-auto">
          Welcome
        </FancyText>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-lg shadow-lg"
        >
          <div className="mb-8 text-center">
            <div 
              ref={logoRef}
              className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden"
              style={{
                transition: 'transform 0.1s ease-out',
                transform: `rotate(${rotation}deg)`
              }}
            >
              <img src="/favicon.ico" alt="Logo" className="w-16 h-16" />
            </div>
          </div>

          <button
            onClick={handleSignInWithGoogle}
            className="w-full bg-white text-gray-800 font-semibold py-3 rounded-md shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center"
          >
            <FaGoogle className="mr-2" />
            Sign in with Google
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>By signing in, you agree to our</p>
            <div className="mt-2">
              <span className="cursor-pointer hover:underline">Terms of Service</span>
              {" | "}
              <span className="cursor-pointer hover:underline" onClick={() => router.push("/privacy-policy/privacy-policy.pdf")}>
                Privacy Policy
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-center"
       
       
       >
          {/* <p className="text-gray-600">Don't have an account?</p>
          <span
            onClick={() => router.push("/sign-up")}
            className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer"
          >
            Create one now
          </span> */}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

