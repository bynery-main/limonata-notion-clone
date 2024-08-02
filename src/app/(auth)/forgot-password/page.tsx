"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../../firebase/firebaseConfig';
import { FormSchema } from '@/lib/types';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const [email, setEmail] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '' },
  });

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
      setEmail('');
      router.push('/login');
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes('auth/invalid-email')) {
          toast.error('Invalid email: Please check your email');
        } else if (e.message.includes('auth/user-not-found')) {
          toast.error('User not found: Please check your email');
        } else {
          toast.error(e.message);
        }
      }
    }
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
                            Forgot Password
                          </div>
                        </div>
                      </div>
                      <form onSubmit={handlePasswordReset} className="flex flex-col items-center w-full">
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full p-3 mb-4 bg-white rounded-[25px] outline-none text-black placeholder-gray-500 shadow-[5px_5px_10px_#0000001a]"
                        />
                        <button
                          type="submit"
                          className="w-full p-3 bg-[#ff5924] rounded-[25px] text-white hover:bg-[#ff7a4c] shadow-[5px_5px_10px_#0000001a] mb-4"
                        >
                          Send Password Reset Email
                        </button>
                      </form>
                      <div className="flex flex-col items-center w-full">
                        <p className="text-lg mb-4">
                          Remembered your password?{' '}
                          <a href="/login" className="text-[#ff5924] underline cursor-pointer">
                            Sign In
                          </a>
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

export default ForgotPasswordPage;
