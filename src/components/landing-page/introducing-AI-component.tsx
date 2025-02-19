import React from 'react';
import FancyText from '@carefully-coded/react-text-gradient';
import LottieParent from './lottie-parent';

const IntroductionComponent = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto py-24 px-6 md:px-8">
      <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
        {/* Text Content */}
        <div className="w-full md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight">
            Introducing the{' '}
            <FancyText 
              gradient={{ from: '#FE7EF4', to: '#F6B144' }}
              className="font-bold"
            >
              power of AI
            </FancyText>
            {' '}to your learning
          </h2>
          
          <div className="space-y-6 text-gray-600">
            <p className="text-lg md:text-xl leading-relaxed">
              Don't waste time creating study resources or{' '}
              <span className="text-gray-900 font-medium">prompting ChatGPT.</span>
            </p>
            
            <p className="text-lg md:text-xl leading-relaxed">
              In Limonata, you can add your own and your peer's study notes. All
              of this will be used by your AI to generate{' '}
              <span className="text-gray-900 font-medium">personalized study materials.</span>
            </p>
            
            <p className="text-lg md:text-xl leading-relaxed">
              And don't forget,{' '}
              <a 
                href="#" 
                className="text-[#FE7EF4] hover:text-[#F6B144] transition-colors duration-300 font-medium"
              >
                it's all collaborative!
              </a>
            </p>
          </div>
        </div>

        {/* Animation/Image */}
        <div className="w-full md:w-1/2">
          <div className="relative w-full aspect-square flex items-center justify-center">
            <LottieParent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionComponent;