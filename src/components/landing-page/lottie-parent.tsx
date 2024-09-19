import dynamic from 'next/dynamic';

const DynamicLottieAnimation = dynamic(() => import('./lottie-animation'), {
  ssr: false,
});

const LottieParent: React.FC = () => {
  return (
    <div>
      <DynamicLottieAnimation />
      {/* Other components */}
    </div>
  );
};

export default LottieParent;