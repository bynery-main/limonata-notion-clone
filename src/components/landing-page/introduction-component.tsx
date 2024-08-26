import inputTypesImage from './Images/Input-Types-Images.png';

export default function IntroductionComponent() {
  return (
    <div className="flex space-x-10 mx-40 mt-40">
      <img
        src={inputTypesImage.src}
        alt="Input Types Images"
        style={{ float: "left", width: "50%", height: "auto", objectFit: "contain" }}
      />
      <div className="flex flex-col justify-center space-y-4">
        <h2 className="text-3xl font-bold text-left">
          Don&apos;t only take notes. Learn.
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
    </div>
  );
}