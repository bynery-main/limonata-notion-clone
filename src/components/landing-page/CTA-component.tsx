import inputTypesImage from './Images/Input-Types-Images.png';

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
    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
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
<div className="flex flex-col items-center space-y-40 justify-center text-5xl text-black mx-40 mt-40">
    Make AI be at the service of your learning. 
    <AnimatedButton className="text-2xl my-20 rounded-full" style={{ width: '200px', height: '50px'}} onClick={() => console.log("Clicked!")}>
        Get Started
    </AnimatedButton>
</div>
  );
}