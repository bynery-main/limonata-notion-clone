import React from 'react';
import Image from 'next/image';
import AIImage from '../../../public/Images/AI.png';
import FancyText from '@carefully-coded/react-text-gradient';
import Lottie from 'lottie-react';
import InputTypes from '../../../public/Images/Input-Types.json';
// import LottieAnimation from './lottie-animation';
import LottieParent from './lottie-parent';


export default function IntroductionComponent() {
  return (
    <div className="w-full max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1400px] mx-auto my-16 sm:my-24 md:my-20 lg:my-28 px-4 sm:px-10 md:px-40 lg:px-40">
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
          <p className="text-base sm:text-lg md:text-lg lg:text-lg -mr-20">
            Don't  waste time creating study resources or <b>prompting ChatGPT. </b>
            <br /> <br />
            In Limonata, you can add your own and your peer&apos;s study notes. All
            of this will be by your AI used to generate  <b>personalized study materials.</b>
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
           {/* Static Image
            <Image 
              src={AIImage} 
              alt="AI Image" 
              layout="fill"
              objectFit="contain"
              priority
            />
            */}
              <div className="relative w-full h-full flex items-center justify-center pl-20 mt-20">
                {/* <Lottie 
                  animationData={InputTypes} 
                  loop={true} 
                  className="min-w-[800px] h-[800px] -ml-20 "
                /> */}

                <LottieParent />
              </div>       
              </div>       

               </div>
      </div>
    </div>
  );
}