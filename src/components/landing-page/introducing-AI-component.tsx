import React from 'react';
import Image from 'next/image';
import AIImage from '../../../public/Images/AI.png';
import FancyText from '@carefully-coded/react-text-gradient';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AIAnimation from '../../../public/Images/AILottieExport.json';
export default function IntroductionComponent() {
  return (
    <div className="w-full max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1400px] mx-40">
      <div className="flex flex-col-reverse md:flex-row md:items-center">
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 sm:space-y-6">
          <h2 className="sm:text-4xl md:text-4xl lg:text-5xl leading-tight">
            Introducing the{' '}
            <FancyText 
              gradient={{ from: '#FE7EF4', to: '#F6B144' }}
              className="font-extrabold"
            >
              power of AI
            </FancyText>
            {' '}to your learning.
          </h2>
          <p className="text-base sm:text-lg md:text-lg lg:text-lg">
            You can add study notes as images, links, notes, videos, quotes,
            PDFs, articles, any study resource from the web, or your computer.
          </p>
          <p className="text-base sm:text-lg md:text-lg lg:text-lg">
            And don&apos;t forget,{" "}
            <a href="#" className="text-blue-500 underline hover:text-blue-600 transition-colors duration-200">
              it&apos;s all collaborative!
            </a>
          </p>
        </div>
        <div className="relative ">
        <div className=" w-[125%] overflow-visible -ml-80">
          <DotLottieReact       
            src='https://lottie.host/29673738-770c-4b7e-9d9f-6733b3c4c6e7/8KYAf1OB8n.json'
            loop
            autoplay
            />
          </div>
        </div>
      </div>
    </div>
  );
}