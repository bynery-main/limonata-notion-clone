'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../../firebase/firebaseConfig";
import { UserCredential } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import the icons

const SignUpFormSchema = z
  .object({
    email: z.string().describe('Email').email({ message: 'Invalid Email' }),
    password: z
      .string()
      .describe('Password')
      .min(6, 'Password must be minimum 6 characters'),
    confirmPassword: z
      .string()
      .describe('Confirm Password')
      .min(6, 'Password must be minimum 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export const StyledSignUpPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [createUserWithEmailAndPassword, , error] = useCreateUserWithEmailAndPassword(auth);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    // Validation checks
    if (!email) {
      toast.error('Please provide a valid email address.');
      return;
    }
    if (!password) {
      toast.error('Please provide a password.');
      return; 
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
  
    // Attempt to create user with email and password
    try {
      const userCredential: UserCredential | undefined = await createUserWithEmailAndPassword(email, password);
      if (!userCredential) {
        toast.error('Failed to create user.');
        return;
      }
      console.log({ userCredential });
      sessionStorage.setItem('user', 'true');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      router.push('/');
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
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
                            Create a new<br />account
                          </div>
                        </div>
                      </div>
                      <form onSubmit={handleSignUp} className="flex flex-col items-center w-full">
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
                        <div className="w-full relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className="w-full p-3 mb-4 bg-white rounded-[25px] outline-none text-black placeholder-gray-500 shadow-[5px_5px_10px_#0000001a]"
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-4 top-4"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="w-full p-3 bg-[#ff5924] rounded-[25px] text-white hover:bg-[#ff7a4c] shadow-[5px_5px_10px_#0000001a] mb-4"
                        >
                          Sign Up
                        </button>
                      </form>
                    </div>
                    <div className="flex flex-col w-[373px] items-start pt-[50px] pb-0 px-0 relative flex-[0_0_auto]">
                      <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                        <p className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Light',Helvetica] font-light text-transparent text-[22px] text-center tracking-[0] leading-[30px] whitespace-nowrap">
                          <span className="text-black">Already have an account? </span>
                          <span onClick={() => router.push("/login")} className="text-[#ff5924] underline cursor-pointer">Sign in here.</span>
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex flex-col items-start pt-5 pb-0 px-0 relative flex-[0_0_auto]">
                      <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                        <p className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Light',Helvetica] font-light text-black text-lg text-center tracking-[0] leading-[30px] whitespace-nowrap">
                          <span className="underline cursor-pointer">Terms of Use</span>
                          <span className="[font-family:'Nunito-Light',Helvetica] font-light text-black text-lg tracking-[0] leading-[30px]">
                            {" "}
                            |{" "}
                          </span>
                          <span className="underline cursor-pointer">Privacy Policy</span>
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

export default StyledSignUpPage;
