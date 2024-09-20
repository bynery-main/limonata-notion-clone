import React from "react";
import Navbar from "../landing-page/navbar";

interface NavbarAuthButtonProps {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const NavbarAuthButton: React.FC<NavbarAuthButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className="inline-flex text-md items-center justify-center h-[3.5vw] px-10 py-0 font-semibold text-center text-gray-200 no-underline align-middle transition-all duration-300 ease-in-out bg-transparent border-2 border-orange-500 border-solid rounded-full cursor-pointer select-none hover:text-gray-100 hover:border-orange-300 focus:shadow-xs focus:no-underline"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default NavbarAuthButton;