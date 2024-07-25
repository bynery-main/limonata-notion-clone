'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "@/firebase/firebaseConfig";
import { deleteUser } from 'firebase/auth';
import ConfirmationModal from '@/components/settings/ConfirmationModal';
import { Toaster, toast } from 'react-hot-toast';

const SettingsPage = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('No user is currently signed in.');
      return;
    }

    try {
      await deleteUser(user);
      toast.success('Account deleted successfully.');
      router.push('/login'); // Redirect to login page after account deletion
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please re-login and try again.');
        // Redirect to login page or re-authenticate the user here
        router.push('/login');
      } else {
        console.error('Error deleting account:', error);
        toast.error('Error deleting account. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <div>
      <Toaster />
      <h1>Settings</h1>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: '#ff5924', // Same red color
          color: 'white', // White text
          padding: '10px',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Delete Account
      </button>
      {showModal && (
        <ConfirmationModal
          onConfirm={handleDeleteAccount}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SettingsPage;
