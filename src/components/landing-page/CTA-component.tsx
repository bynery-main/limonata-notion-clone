import React from 'react';
import FancyText from '@carefully-coded/react-text-gradient';
import { Button } from "@/components/ui/button";
import styled, { keyframes } from 'styled-components';

const gradientAnimation = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

const AnimatedButton = styled(Button)`
    background: linear-gradient(-45deg, #FE7EF4, #F6B144);
    background-size: 400% 400%;
    animation: ${gradientAnimation} 15s ease infinite;
    border: none;
    color: white;
    font-weight: bold;
    
    &:hover {
        opacity: 0.9;
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

export default function CTAComponent() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 my-16 sm:my-30 md:my-40 lg:my-50 mx-auto max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-black">
        Make{' '}
        <FancyText 
          gradient={{ from: '#F6B144', to: '#FE7EF4' }}
          className="font-extrabold"
        >
          AI
        </FancyText>
        {' '}be at the service of your learning.
      </h2> 
      <AnimatedButton 
        className="mt-8 sm:mt-10 rounded-full text-base sm:text-md md:text-md lg:text-lg font-light px-6 py-4 sm:px-8 sm:py-5" 
        onClick={() => console.log("Clicked!")}
      >
        Get Started
      </AnimatedButton>
      <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-3">
        Yes. It's free.
      </p>
    </div>
  );
}