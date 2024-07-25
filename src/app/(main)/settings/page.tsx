// page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "@/firebase/firebaseConfig";
import { deleteUser } from 'firebase/auth';

const SettingsPage = () => {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('No user is currently signed in.');
      return;
    }

    try {
      await deleteUser(user);
      alert('Account deleted successfully.');
      router.push('/login'); // Redirect to login page after account deletion
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert('Please re-login and try again.');
        // Redirect to login page or re-authenticate the user here
        router.push('/login');
      } else {
        console.error('Error deleting account:', error);
        alert('Error deleting account. Please try again.');
      }
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <button
        onClick={handleDeleteAccount}
        style={{
          background: 'red',
          color: 'white',
          padding: '10px',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Delete Account
      </button>
    </div>
  );
};

export default SettingsPage;
