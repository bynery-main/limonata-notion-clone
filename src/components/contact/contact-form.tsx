"use client";
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import FancyText from "@carefully-coded/react-text-gradient";
import toast from 'react-hot-toast';
import { FilloutStandardEmbed } from "@fillout/react";
import "@fillout/react/style.css";
import { Header } from '../landing-page/header';
import Footer from '../landing-page/UI/Footer/Footer';
import Navbar from '../landing-page/navbar';

const FirebaseContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const docRef = await addDoc(collection(db, 'contactSubmissions'), {
        name,
        email,
        subject,
        message,
        timestamp: new Date()
      });

      console.log("Document written with ID: ", docRef.id);
      toast.success('Message sent successfully!');

      // Clear form fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
        <Navbar />

    <div className="min-h-screen flex items-center justify-center">
      
      <div className="bg-white p-8 rounded-lg justify-center shadow-2xl w-full max-w-lg  mb-8 w-400 h-auto">
        <div className="text-center">
          <FancyText
            gradient={{ from: '#FE7EF4', to: '#F6B144' }}
            className="text-4xl font-bold mb-2"
          >
            Contact Us
          </FancyText>
          <p className="text-gray-600">We&apos;d love to hear from you</p>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh', // Full viewport height to center vertically
          }}
        >
          <div
            style={{
              width: 400,
              height: 400,
            }}
          >
            <FilloutStandardEmbed filloutId="wG2BWAgeBdus" />
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </div>
  );
};

export default FirebaseContactForm;