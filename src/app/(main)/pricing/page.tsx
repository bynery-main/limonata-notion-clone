"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LightbulbIcon, MessageCircleIcon, BookIcon, PencilIcon, BookOpenIcon } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Ensure this import path is correct
import { motion } from "framer-motion";
import { Header } from '@/components/landing-page/header';
import Navbar from '@/components/landing-page/navbar';
import Footer from '@/components/footer/footer';
import { GoProButton } from "@/components/subscribe/subscribe-button";
import { WavyBackground } from "@/components/ui/wavy-background";
interface PlanFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="flex items-start mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="bg-gray-100 rounded-full p-2 mr-3 mt-1">
        {icon}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{title}</h3>
        <div className="grid grid-cols-2 gap-4 mt-1">
          <p className="text-sm text-gray-600">{description}</p>
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


interface PricingPageProps {
  user: {
    uid: string;
    email: string;
  } | null;
}

const PricingPage: React.FC<PricingPageProps> = ({ user }) => {
  const [credits, setCredits] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [tier, setTier] = useState("free");
  const [maxCredits, setMaxCredits] = useState(100);

  const currentUserUid = user?.uid || "";
  const currentUserEmail = user?.email || "";

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
    <div className="flex flex-col items-centerjustify-center min-h-screen  min-w-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <Navbar/>
          
          <WavyBackground 
          className="max-w-4xl mx-auto py-20"
          backgroundFill='white'
          colors={["#F988B4", "#F7B64F", "#C66EC5", "#F7B64F", "#F988B4"]}
          waveWidth={30}
          waveOpacity={0.3}
          blur={20}>
      <motion.div 
        className="text-center mb-8 mt-16  mt-20 md:mt-24"
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

        >
          <Card className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold mb-4">Free Plan</h2>
            <p className="text-gray-600 mb-6">100 credits per month</p>
            <PlanFeature 
              icon={<BookOpenIcon />} 
              title="Flashcards" 
              description="Up to 6 flashcard decks per month" 
            />
            <PlanFeature 
              icon={<MessageCircleIcon />} 
              title="AI Chat Messages" 
              description="Up to 20 AI chat sessions per month" 
            />
            <PlanFeature 
              icon={<PencilIcon />} 
              title="Quizzes" 
              description="Create up to 5 quizzes per month" 
            />
            <PlanFeature 
              icon={<BookIcon />} 
              title="Study Guides" 
              description="Generate up to 6 study guides per month" 
            />
            <div className="mt-6">
              <p className="text-xl font-bold">$0 <span className="text-sm font-normal text-gray-600">/month</span></p>
            </div>
          </Card>
        </motion.div>

        <motion.div
        >
          <Card className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold mb-4">Pro Plan</h2>
            <p className="text-gray-600 mb-6">1000 credits per month</p>
            <PlanFeature 
              icon={<BookOpenIcon />} 
              title="Flashcards" 
              description="Up to 60 flashcard decks per month" 
            />
            <PlanFeature 
              icon={<MessageCircleIcon />} 
              title="AI Chat Messages" 
              description="Up to 200 AI chat sessions per month" 
            />
            <PlanFeature 
              icon={<PencilIcon />} 
              title="Quizzes" 
              description="Create up to 50 quizzes per month" 
            />
            <PlanFeature 
              icon={<BookIcon />} 
              title="Study Guides" 
              description="Generate up to 60 study guides per month" 
            />
            <div className="mt-6">
              <p className="text-xl font-bold">$4.99 <span className="text-sm font-normal text-gray-600">/month</span></p>
            </div>
            <div className="mt-6">
              <GoProButton 
                userId={currentUserUid}
                userEmail={currentUserEmail}
                subscriptionStatus={subscriptionStatus}
              />
            </div>
          </Card>
        </motion.div>

      </div>
      </WavyBackground>
      <Footer />
    </div>
  );
};

export default PricingPage;