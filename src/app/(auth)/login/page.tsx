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
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import the icons

const LoginPage = (): JSX.Element => { // Changed to const
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const provider = new GoogleAuthProvider();

  // Redirect if user is already logged in
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

  const handleSignInWithApple = () => {
    // Implement Apple sign-in logic here
    toast.error("Apple sign-in not implemented yet");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1440px] h-[810px]">
        <div className="flex flex-col w-[1440px] h-[810px] items-start px-[35px] py-0 relative">
          <div className="relative w-[1370px] h-[810px] bg-[#f6f8fa] overflow-hidden">
            <div className="relative w-[1426px] h-[810px] left-[-31px]">
              <div className="flex w-[1426px] h-[810px] items-start justify-center absolute top-0 left-0">
                <div className="relative w-[754px] h-[740px] bg-[#f6f8fa] overflow-hidden">
                  <div className="flex flex-col w-[654px] h-[740.4px] items-center justify-center pl-[140.42px] pr-[140.55px] py-0 relative top-[50px] left-[50px]">
                    <div className="inline-flex flex-col h-[510px] items-center justify-center px-0 py-[45.7px] relative">
                      <div className="inline-flex flex-col max-w-[400px] items-start pt-0 pb-5 px-0 relative flex-[0_0_auto]">
                        <div className="inline-flex flex-col max-w-[400px] items-center relative flex-[0_0_auto]">
                          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[66.2px] text-center tracking-[-4.00px] leading-[80px]">
                            Sign in to
                            <br />
                            your account
                          </div>
                        </div>
                      </div>
                      <form
                        onSubmit={handleSignInWithEmail}
                        className="flex flex-col items-center w-full"
                      >
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full p-3 mb-4 bg-white rounded-[25px] outline-none text-black placeholder-gray-500 shadow-[5px_5px_10px_#0000001a]"
                        />
                        <div className="w-full relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={handlePasswordChange}
                            className="w-full p-3 mb-4 bg-white rounded-[25px] outline-none text-black placeholder-gray-500 shadow-[5px_5px_10px_#0000001a]"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-4"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="w-full p-3 bg-[#ff5924] rounded-[25px] text-white hover:bg-[#ff7a4c] shadow-[5px_5px_10px_#0000001a] mb-4"
                        >
                          Sign In
                        </button>
                      </form>
                      <div className="inline-flex flex-col items-start pt-5 pb-0 px-0 relative flex-[0_0_auto]">
                        <button
                          onClick={handleSignInWithGoogle}
                          className="pl-[42.97px] pr-[41.34px] py-3.5 flex w-[300px] h-[50px] items-center justify-center relative bg-white rounded-[25px] overflow-hidden shadow-[5px_5px_10px_#0000001a] mb-4"
                        >
                          <img
                            className="relative self-stretch w-full object-contain"
                            alt="Google logo"
                            src="auth-logos/google-logo.png"
                          />
                          <div className="inline-flex flex-col items-center relative flex-[0_0_auto] ml-[-0.31px] opacity-60">
                            <div className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Regular',Helvetica] font-normal text-black text-xl text-center tracking-[0] leading-[22px] whitespace-nowrap">
                              Sign in with Google
                            </div>
                          </div>
                        </button>
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <a
                          href="/forgot-password"
                          className="text-[#ff5924] text-sm underline cursor-pointer mb-4"
                        >
                          Forgot Password?
                        </a>
                        <p className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Light',Helvetica] font-light text-black text-lg text-center tracking-[0] leading-[30px] whitespace-nowrap">
                          Don&apos;t have an account?{" "}
                          <span
                            onClick={() => router.push("/sign-up")}
                            className="text-[#ff5924] underline cursor-pointer"
                          >
                            Sign up here.
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex flex-col items-start pt-5 pb-0 px-0 relative flex-[0_0_auto]">
                      <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                        <p className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Light',Helvetica] font-light text-black text-lg text-center tracking-[0] leading-[30px] whitespace-nowrap">
                          <span className="underline cursor-pointer">
                            Terms of Use
                          </span>
                          <span className="[font-family:'Nunito-Light',Helvetica] font-light text-black text-lg tracking-[0] leading-[30px]">
                            {" "}
                            |{" "}
                          </span>
                          <span className="underline cursor-pointer">
                            Privacy Policy
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
