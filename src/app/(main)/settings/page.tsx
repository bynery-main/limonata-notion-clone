'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from "@/firebase/firebaseConfig";
import { deleteUser } from 'firebase/auth';
import { Toaster, toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import UnsubscribeButton from '@/components/subscribe/unsubscribe-button';
import GoProButton from '@/components/subscribe/subscribe-button';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/auth-provider/AuthProvider';

const SettingsPage = () => {
  const router = useRouter();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);

  const { user } = useAuth();
  const currentUserUid = user?.uid || "";

  useEffect(() => {
    if (!currentUserUid) return;

    const userDocRef = doc(db, "users", currentUserUid);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setSubscriptionStatus(userData?.subscriptionStatus || "inactive");
        setTier(userData?.tier || "free");
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('No user is currently signed in.');
      return;
    }

    try {
      console.log('Deleting account for user:', user.uid);
      await deleteUser(user);
      toast.success('Account deleted successfully.');
      router.push('/login'); // Redirect to login page after account deletion
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please re-login and try again.');
        router.push('/login');
      } else {
        console.error('Error deleting account:', error);
        toast.error('Error deleting account. Please try again.');
      }
    }
  };

  const handleCancelAccount = () => {
    setShowAccountModal(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, onCancel: () => void) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div>
      <Toaster />
      <h1>Settings</h1>

      <Button
        onClick={() => setShowAccountModal(true)}
        style={{
          background: '#ff5924', // Red color
          color: 'white', // White text
          padding: '10px',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Delete Account
      </Button>

      {showAccountModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
          onClick={(e) => handleOverlayClick(e, handleCancelAccount)}
        >
          <div
            className="relative bg-white rounded-[53px] shadow-2xl p-10 w-[606px] z-[10000]"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', opacity: 1 }} // Ensure the background is fully opaque
          >
            <div className="text-center mb-8">
              <h2 className="font-medium text-black text-3xl mb-2">Are you sure you want to delete your account?</h2>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleDeleteAccount}
                className="bg-[#ff5924] text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-[#e54e1f] transition-colors"
                style={{ color: 'white' }} // Ensure the text color is white
              >
                Delete Account
              </Button>
              <Button
                onClick={handleCancelAccount}
                className="bg-gray-300 text-gray-700 font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Button - render either Unsubscribe or GoPro depending on status */}
      {tier === 'pro' && (
        <div className="mt-10">
          {subscriptionStatus === 'active_pending_cancellation' ? (
            <GoProButton
              userId={currentUserUid}
              userEmail={user?.email || ''}
              subscriptionStatus={subscriptionStatus}
            />
          ) : (
            <UnsubscribeButton
              userId={currentUserUid}
              subscriptionStatus={subscriptionStatus || "inactive"}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
