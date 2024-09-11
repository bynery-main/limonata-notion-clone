"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import FancyText from "@carefully-coded/react-text-gradient";

const LoginPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const provider = new GoogleAuthProvider();

  if (user) {
    router.push("/dashboard");
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSignInWithEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes("auth/invalid-email")) {
          toast.error("Invalid email: Please check your email");
        } else if (e.message.includes("auth/invalid-credential")) {
          toast.error("Invalid credentials: Please check your email and password");
        } else {
          toast.error(e.message);
        }
      }
    }
  };

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

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <FancyText
            gradient={{ from: '#FE7EF4', to: '#F6B144' }}
            className="text-4xl font-bold mb-2"
          >
            Welcome Back
          </FancyText>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSignInWithEmail} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F7B64F]"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#C66EC5] to-[#FC608D] text-white py-2 rounded-md hover:from-purple-700 hover:to-pink-700 transition duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSignInWithGoogle}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img
                className="h-5 w-5 mr-2"
                src="auth-logos/google-logo.png"
                alt="Google logo"
              />
              Sign in with Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/sign-up")}
            className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer"
          >
            Sign Up
          </span>
        </p>

        <div className="mt-6 text-center text-xs text-gray-500">
          <span className="cursor-pointer hover:underline">Terms of Use</span>
          {" | "}
          <span className="cursor-pointer hover:underline" onClick={() => router.push("/privacy-policy/privacy-policy.pdf")}
          >Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;