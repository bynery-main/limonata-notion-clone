"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

export const FloatingNav = ({
  navItems,
  className,
  user,
  onLogin,
  onLogout,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white bg-opacity-75 backdrop-blur-sm                     shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4",
          className
        )}
      >
        {navItems.map((navItem: any, idx: number) => (
          <Link
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500",
              pathname === navItem.link && "text-transparent bg-clip-text bg-gradient-to-r from-[#FE7EF4] to-[#F6B144]"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
            {pathname === navItem.link && (
              <motion.span
                className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-[#FE7EF4] to-[#F6B144]"
                layoutId="underline"
              />
            )}
          </Link>
        ))}
        {user ? (
          <button
            onClick={onLogout}
            className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200 dark:border-white/[0.2]"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-full h-full p-1 text-neutral-600 dark:text-neutral-300" />
            )}
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="relative text-sm font-medium text-black dark:text-white px-4 py-2 rounded-full overflow-hidden"
          >
            <span className="relative z-10">Login</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] opacity-20" />
            <span className="absolute inset-0 border border-transparent dark:border-white/[0.2] rounded-full bg-gradient-to-r from-[#FE7EF4] to-[#F6B144] opacity-50" style={{ padding: '1px' }} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};