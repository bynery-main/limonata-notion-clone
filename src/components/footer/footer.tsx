import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  const gradientHoverClass = "hover:bg-gradient-to-r hover:from-[#FE7EF4] hover:to-[#F6B144] hover:text-transparent hover:bg-clip-text transition-all duration-300";

  const footerLinks = [
    { text: "Contact", href: "#" },
    { text: "Privacy Policy", href: "/privacy-policy/privacy-policy.pdf" },
    { text: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4">
            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className={`text-white hover:text-gray-600 transition-colors duration-200`}
              >
                <Icon size={24} />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {footerLinks.map(({ text, href }, index) => (
              <Link
                key={index}
                href={href}
                target={text === "Privacy Policy" ? "_blank" : undefined}
                rel={text === "Privacy Policy" ? "noopener noreferrer" : undefined}
                className={`text-sm ${gradientHoverClass}`}
              >
                {text}
              </Link>
            ))}
          </div>

          <p className="text-sm">
            © {new Date().getFullYear()} Limonata Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;