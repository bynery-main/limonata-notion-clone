import React from 'react';
import Image from 'next/image';
import AIImage from '../../../public/Images/AI.png';
import FancyText from '@carefully-coded/react-text-gradient';

export default function IntroductionComponent() {
  return (
    <div className="w-full max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1400px] mx-auto my-16 sm:my-24 md:my-32 lg:my-40 px-4 sm:px-10 md:px-40 lg:px-40">
      <div className="flex flex-col-reverse md:flex-row md:items-center md:space-x-8 lg:space-x-16">
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 sm:space-y-6 mt-8 md:mt-0">
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
        <div className="w-full md:w-1/2 relative">
          <div className="w-full aspect-square md:-mt-16 lg:-mt-24 xl:-mt-32">
            <Image 
              src={AIImage} 
              alt="AI Image" 
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}