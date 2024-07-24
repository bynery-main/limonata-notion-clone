"use client";

import { useState, ChangeEvent, FormEvent } from "react";
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
import { useAuth } from "@/components/AuthProvider";

const LoginPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const provider = new GoogleAuthProvider();

  // Redirect if user is already logged in
  if (user) {
    router.push("/dashboard");
    return null;
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
          toast.error(
            "Invalid credentials: Please check your email and password"
          );
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-10">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-white text-2xl mb-5">Sign In</h1>
        <form onSubmit={handleSignInWithEmail}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
          />
          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 mb-4"
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={handleSignInWithGoogle}
            className="w-full p-3 bg-red-600 rounded text-white hover:bg-red-500"
          >
            Sign In with Google
          </button>
          <p
            onClick={() => router.push("/forgot-password")}
            className="text-red-500 hover:text-red-600 cursor-pointer text-sm mt-4 text-center"
          >
            Forgot Password?
          </p>
          <p className="text-gray-500 mt-4">
            Don't have an account?
            <a
              href="/sign-up"
              className="text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              {" "}
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
