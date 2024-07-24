import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-8">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Limonata Project</h2>
          <p className="text-sm">
            © {new Date().getFullYear()} Limonata Project. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-left">
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
      </div>
    </footer>
  );
};

export default Footer;
