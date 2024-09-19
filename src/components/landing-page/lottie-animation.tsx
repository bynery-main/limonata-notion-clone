import React, { useRef, useEffect } from 'react';
import Lottie, { LottieComponentProps, LottieRefCurrentProps } from 'lottie-react';
import InputTypes from '../../../public/Images/Input-Types.json'; // Adjust this import as needed

const LottieAnimation: React.FC = () => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  useEffect(() => {
    // Set the speed when the component mounts
    if (typeof window !== 'undefined' && lottieRef.current) {
        lottieRef.current.setSpeed(0.5); // Adjust this value to change the speed (1 is normal speed)
      }
  }, []);

  const lottieProps: LottieComponentProps = {
    animationData: InputTypes,
    loop: true,
    lottieRef: lottieRef, // Directly assign the lottieRef
  };

  return (
    <>
      <Lottie {...lottieProps} className="min-w-[800px] h-[800px] -ml-20" />
    </>
  );
};

export default LottieAnimation;