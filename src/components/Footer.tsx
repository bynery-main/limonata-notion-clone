import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

interface Props {
  platform: "desktop" | "mobile";
  className?: string;
  title?: string;
  textLinkListDensityDefaultClassName?: string;
  textLinkListDensityDefaultClassNameOverride?: string;
  textLinkListDivClassName?: string;
}

const TextLinkList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="flex flex-col mx-14">
    <div className="font-bold mb-7"> {/* Increased bottom margin for more spacing */}
      {title}
    </div>
    <ul className="space-y-2.5"> {/* Added space between rows */}
      {items.map((item, index) => (
        <li key={index} className="mb-1">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const Footer: React.FC<Props> = ({
  platform,
  className,
  title = "title.svg",
  textLinkListDensityDefaultClassName,
  textLinkListDensityDefaultClassNameOverride,
  textLinkListDivClassName,
}: Props) => {
  const useCases = ["UI design", "UX design", "Wireframing", "Diagramming", "Brainstorming", "Online whiteboard", "Team collaboration"];
  const explore = ["Design", "Prototyping", "Development features", "Design systems", "Collaboration features", "Design process", "FigJam"];
  const resources = ["Blog", "Best practices", "Colors", "Color wheel", "Support", "Developers", "Resource library"];

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-8">
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="text-white hover:text-gray-400">
            <FaFacebook size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-400">
            <FaTwitter size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-400">
            <FaInstagram size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-400">
            <FaLinkedin size={24} />
          </a>
        </div>

        <div className="w-full flex justify-center">
          <div
            className={`border-t border-gray-300 w-4/5 flex items-start bg-color-background-default-default relative ${
              platform === "desktop" ? "flex-wrap" : ""
            } ${platform === "mobile" ? "flex-col" : ""} ${
              platform === "mobile" ? "gap-4" : "gap-2"
            } ${
              platform === "mobile"
                ? "pt-4 pr-4 pb-4 pl-4"
                : "pt-4 pr-4 pb-16 pl-4"
            } ${className}`}
            data-responsive-mode={platform === "mobile" ? "mobile" : undefined}
          >
            {platform === "desktop" && (
              <>
                <TextLinkList title="Use cases" items={useCases} />
                <TextLinkList title="Explore" items={explore} />
                <TextLinkList title="Resources" items={resources} />
              </>
            )}

            {platform === "mobile" && (
              <>
                <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                  <TextLinkList title="Use cases" items={useCases} />
                  <TextLinkList title="Explore" items={explore} />
                  <TextLinkList title="Resources" items={resources} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto text-center mt-8 px-4 md:px-8">
        <p className="text-sm">
          © {new Date().getFullYear()} Limonata Project. All rights reserved.
        </p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center mt-4">
          <a href="#" className="text-sm hover:underline">
            About Us
          </a>
          <a href="#" className="text-sm hover:underline">
            Contact
          </a>
          <a href="#" className="text-sm hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="text-sm hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
