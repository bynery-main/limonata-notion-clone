'use client';
import { useState, ChangeEvent, MouseEvent } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../../../firebase/firebaseConfig";
import { UserCredential } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SignUp: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [createUserWithEmailAndPassword, , error] = useCreateUserWithEmailAndPassword(auth);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSignUp = async (event: MouseEvent<HTMLButtonElement>) => {
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
      router.push('/');
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign Up</h1>
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
          onClick={handleSignUp}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign Up
        </button>
        <p className="text-gray-500 mt-4">
          Already have an account? 
          <a href="/login" className="text-blue-500 hover:text-blue-600 cursor-pointer"> Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
