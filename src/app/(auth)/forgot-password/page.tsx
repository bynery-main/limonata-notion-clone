"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../../firebase/firebaseConfig';
import { FormSchema } from '@/lib/types'; // Adjust this path if necessary
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-10">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-white text-2xl mb-5">Forgot Password</h1>
        <form onSubmit={handlePasswordReset}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={handleEmailChange} 
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
          />
          <button 
            type="submit"
            className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 mb-4"
          >
            Send Password Reset Email
          </button>
          {submitError && <p className="text-red-500 text-center mt-4">{submitError}</p>}
          <p className="text-gray-500 mt-4">
            Remembered your password? 
            <a href="/login" className="text-blue-500 hover:text-blue-600 cursor-pointer"> Sign In</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
