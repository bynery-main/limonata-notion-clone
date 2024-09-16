import React from 'react';
import Image from 'next/image';
import inputTypesImage from '../../../public/Images/Input-Types-Images.png';
import FancyText from '@carefully-coded/react-text-gradient';

export default function IntroductionComponent() {
  return (
    <div className="w-full max-w-[70vw] lg:max-w-[70vw] xl:max-w-[1400px] mx-auto px-4 sm:px-10 md:px-15 lg:px-20">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8 lg:space-x-16">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <div className="relative w-full h-0 pb-[75%] md:pb-[90%] lg:pb-[100%]">
            <Image
              src={inputTypesImage}
              alt="Input Types Images"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl leading-tight">
            Don&apos;t only take notes.{' '}
            <FancyText 
              gradient={{ from: '#FE7EF4', to: '#F6B144' }}
              className="font-extrabold"
            >
              Learn.
            </FancyText>
          </h2>
          <p className="text-base sm:text-lg md:text-lg lg:text-xl">
            You can add study notes as images, links, notes, quotes,
            PDFs, articles, any study resource from the web, or your computer.
          </p>
          <p className="text-base sm:text-lg md:text-lg lg:text-xl">
            And don&apos;t forget,{" "}
            <a href="#" className="text-blue-500 underline hover:text-blue-600 transition-colors duration-200">
              it&apos;s all collaborative!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}