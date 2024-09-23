"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LightbulbIcon, MessageCircleIcon, BookIcon, PencilIcon, BookOpenIcon } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Ensure this import path is correct
import { motion } from "framer-motion";

interface PlanFeatureProps {
  icon: React.ReactNode;
  title: string;
  freeAmount: number;
  proAmount: number;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ icon, title, freeAmount, proAmount }) => {
  return (
    <motion.div 
      className="flex items-center mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gray-100 rounded-full p-2 mr-3">
        {icon}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex justify-between mt-1">
          <span className="text-sm text-gray-600">{freeAmount}</span>
          <span className="text-sm text-gray-600">{proAmount}</span>
        </div>
      </div>
    </motion.div>
  );
};

interface SubscribeButtonProps {
  userId: string;
  userEmail: string;
  subscriptionStatus: string;
}

const GoProButton: React.FC<SubscribeButtonProps> = ({ userId, userEmail, subscriptionStatus }) => {
  const handleGoProClick = async () => {
    if (!userId) {
      alert("Please log in to subscribe.");
      return;
    }

    // Implement your subscription logic here
    console.log("Subscribing user:", userId, userEmail);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button onClick={handleGoProClick} className="bg-black text-white px-8 py-2 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors">
        {subscriptionStatus === "active_pending_cancellation" ? "Resubscribe" : "Go Pro Now"}
      </Button>
    </motion.div>
  );
};

const PricingPage: React.FC = () => {
  const [credits, setCredits] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [tier, setTier] = useState("free");
  const [maxCredits, setMaxCredits] = useState(100);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Simulating getting the current user UID
    // In a real app, you'd get this from your auth system
    setCurrentUserUid("someUserUid");
    setUserEmail("user@example.com");
  }, []);

  useEffect(() => {
    if (!currentUserUid) return;

    const userDocRef = doc(db, "users", currentUserUid);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setCredits(userData?.credits || 0);
        setSubscriptionStatus(userData?.subscriptionStatus || "inactive");
        setTier(userData?.tier || "free");
        setMaxCredits(userData?.tier === "pro" ? 1000 : 100);
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
          <span className="bg-black text-white rounded-full p-2 mr-2">
            <LightbulbIcon className="h-6 w-6" />
          </span>
          Get Limonata Pro
        </h1>
        <p className="text-gray-600">No trials. No commitments. <b>10x</b> the amount of credits.</p>
      </motion.div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold mb-4">Free Plan</h2>
            <p className="text-gray-600 mb-6">100 credits per month</p>
            <PlanFeature icon={<BookOpenIcon />} title="Flashcards" freeAmount={6} proAmount={60} />
            <PlanFeature icon={<MessageCircleIcon />} title="AI Chat Messages" freeAmount={20} proAmount={200} />
            <PlanFeature icon={<PencilIcon />} title="Quizzes" freeAmount={5} proAmount={50} />
            <PlanFeature icon={<BookIcon />} title="Study Guides" freeAmount={6} proAmount={60} />
            <div className="mt-6">
              <p className="text-xl font-bold">$0 <span className="text-sm font-normal text-gray-600">/month</span></p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold mb-4">Pro Plan</h2>
            <p className="text-gray-600 mb-6">1000 credits per month</p>
            <PlanFeature icon={<BookOpenIcon />} title="Flashcards" freeAmount={6} proAmount={60} />
            <PlanFeature icon={<MessageCircleIcon />} title="AI Chat Messages" freeAmount={20} proAmount={200} />
            <PlanFeature icon={<PencilIcon />} title="Quizzes" freeAmount={5} proAmount={50} />
            <PlanFeature icon={<BookIcon />} title="Study Guides" freeAmount={6} proAmount={60} />
            <div className="mt-6">
              <p className="text-xl font-bold">$4.99 <span className="text-sm font-normal text-gray-600">/month</span></p>
            </div>
            <div className="mt-6">
              <GoProButton 
                userId={currentUserUid || ""}
                userEmail={userEmail}
                subscriptionStatus={subscriptionStatus}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;