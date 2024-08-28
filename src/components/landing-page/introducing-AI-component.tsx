import Image from 'next/image';
import AIImage from './Images/AI.png';


export default function IntroductionComponent() {
  return (
    <div className="flex space-x-10 mx-40 mt-40">
      <div className="flex flex-col justify-center space-y-4">
        <h2 className="text-5xl font-black text-left">
        Introducing the power of AI to your learning 
        </h2>
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