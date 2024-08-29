import inputTypesImage from './Images/Input-Types-Images.png';
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

export default function CTAcomponent() {
  return (
    <div className="flex flex-col items-center justify-center text-5xl text-black mx-auto my-40 text-center max-w-3xl">
      <p className="leading-tight">
        Make{' '}
        <FancyText 
          gradient={{ from: '#F6B144', to: '#FE7EF4' }}
          className="font-extrabold"
        >
          AI
        </FancyText>
        {' '}be at the service of your learning.
      </p> 
      <AnimatedButton 
        className="text-2xl font-light my-10 rounded-full text-sm" 
        style={{ width: '125px', height: '40px'}} 
        onClick={() => console.log("Clicked!")}
      >
        Get Started
      </AnimatedButton>
    </div>
  );
}