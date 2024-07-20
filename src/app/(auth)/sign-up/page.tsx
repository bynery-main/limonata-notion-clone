'use client';
import { useState, ChangeEvent, MouseEvent } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../../../firebase/firebaseConfig";
import { UserCredential } from 'firebase/auth';

const SignUp: React.FC = () => {
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
    try {
      const userCredential: UserCredential | undefined = await createUserWithEmailAndPassword(email, password);
      if (!userCredential) {
        console.error('Failed to create user.');
        return;
      }
      console.log({ userCredential });
      sessionStorage.setItem('user', 'true');
      setEmail('');
      setPassword('');
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
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
      </div>
    </div>
  );
};

export default SignUp;