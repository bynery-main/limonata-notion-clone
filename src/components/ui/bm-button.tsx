import React from "react";
import Navbar from "../landing-page/navbar";

interface NavbarAuthButtonProps {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const NavbarAuthButton: React.FC<NavbarAuthButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className="inline-flex text-md items-center justify-center h-[3vw] px-7 py-0 font-semibold text-center text-gray-300 no-underline align-middle transition-all duration-300 ease-in-out bg-transparent border-2 border-orange-500 border-solid rounded-full cursor-pointer select-none hover:text-gray-100 hover:border-orange-200 focus:shadow-xs focus:no-underline"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default NavbarAuthButton;