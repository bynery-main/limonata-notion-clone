'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase/firebaseConfig";
import { deleteUser } from 'firebase/auth';
import { Toaster, toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import UnsubscribeButton from '@/components/subscribe/unsubscribe-button';
import GoProButton from '@/components/subscribe/subscribe-button';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/auth-provider/AuthProvider';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { MainSidebar } from '@/components/sidebar/main-sidebar';
const SettingsPage = () => {
  const router = useRouter();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>('free'); // Defaulting to 'free'
  const [credits, setCredits] = useState<number | null>(null);
  const [subscriptionCurrentPeriodEnd, setSubscriptionCurrentPeriodEnd] = useState<string | null>(null);

  const { user } = useAuth();
  const currentUserUid = user?.uid || "";

  useEffect(() => {
    if (!currentUserUid) return;

    const userDocRef = doc(db, "users", currentUserUid);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setCredits(userData?.credits || 0);
        setTier(userData?.tier || "free");

        if (userData?.tier === "pro") {
          setSubscriptionStatus(userData?.subscriptionStatus || "inactive");

          // Convert Firestore Timestamp to a human-readable date string
          const subscriptionEnd = userData?.subscriptionCurrentPeriodEnd;
          if (subscriptionEnd instanceof Timestamp) {
            setSubscriptionCurrentPeriodEnd(subscriptionEnd.toDate().toLocaleDateString());
          } else {
            setSubscriptionCurrentPeriodEnd(null);
          }
        } else {
          // If the user is on the free tier, these fields might not exist
          setSubscriptionStatus(null);
          setSubscriptionCurrentPeriodEnd(null);
        }
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
    <div className="flex">
      <MainSidebar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-6 max-w-4xl mx-auto space-y-8"
      >
        <Toaster />
        <motion.h1 
          className="text-3xl font-bold flex items-center space-x-2"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Settings className="w-8 h-8" />
          <span>Settings</span>
        </motion.h1>

        <motion.div 
          className="bg-white shadow-lg rounded-lg p-6 space-y-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div className="flex items-center space-x-2" whileHover={{ x: 5 }}>
            <CreditCard className="w-6 h-6 text-blue-500" />
            <p><strong>Remaining credits: </strong> {credits}</p>
          </motion.div>
          <motion.div className="flex items-center space-x-2" whileHover={{ x: 5 }}>
            <Calendar className="w-6 h-6 text-green-500" />
            <p>
              <strong>Subscription status: </strong>
              {subscriptionStatus === 'active_pending_cancellation' ? 'active, pending cancellation' : (subscriptionStatus || "No active subscription")}
            </p>
          </motion.div>
          {tier === 'pro' && (
            <motion.div className="flex items-center space-x-2" whileHover={{ x: 5 }}>
              <Calendar className="w-6 h-6 text-purple-500" />
              <p><strong>{subscriptionStatus === 'active_pending_cancellation' ? 'Your subscription will end on: ' : 'You will be billed again on: '}</strong> {subscriptionCurrentPeriodEnd || "N/A"}</p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => setShowAccountModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center space-x-2 transition-colors duration-300"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Account</span>
          </Button>
        </motion.div>

        {showAccountModal && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
            onClick={(e) => handleOverlayClick(e, handleCancelAccount)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-[53px] shadow-2xl p-10 w-[606px] z-[10000]"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="text-center mb-8">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="font-medium text-black text-3xl mb-2">Are you sure you want to delete your account?</h2>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-6 py-3 shadow-md transition-colors duration-300 flex items-center space-x-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Account</span>
                </Button>
                <Button
                  onClick={handleCancelAccount}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold rounded-full px-6 py-3 shadow-md transition-colors duration-300"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {tier === 'pro' && (
          <motion.div 
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SettingsPage;