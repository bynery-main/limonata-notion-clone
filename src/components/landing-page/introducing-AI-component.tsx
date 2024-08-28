import Image from 'next/image';
import AIImage from './Images/AI.png';
import FancyText from '@carefully-coded/react-text-gradient';


export default function IntroductionComponent() {
  return (
    <div className="flex space-x-10 mx-40 mt-40">
      <div className="flex flex-col justify-center space-y-4">
      <p className="leading-tight text-5xl">
        Introducing the{' '}
        <FancyText 
          gradient={{ from: '#FE7EF4', to: '#F6B144' }}
          className="font-extrabold"
        >
          power of AI
        </FancyText>
        {' '}to your learning.
      </p>
        <p className="text-left">
          You can add study notes as images, links, notes, videos, quotes,
          PDFs, articles, any study resource from the web, or your computer.
        </p>
        <p className="text-left">
          And don&apos;t forget,{" "}
          <a href="#" className="text-blue-500 underline">
            it&apos;s all collaborative!
          </a>
        </p>
      </div>
      <Image src={AIImage} alt="AI Image" width={800} style={{ objectFit: "contain" }} className='-my-40'/>
    </div>
  );
}