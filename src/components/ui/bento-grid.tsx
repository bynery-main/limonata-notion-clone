import React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto p-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  href,
}: {
  className?: string;
  title: string;
  description: string;
  header: React.ReactNode;
  icon?: React.ReactNode;
  href: string;
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border-2 border-neutral-200 dark:border-neutral-800 flex flex-col space-y-4 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="aspect-w-16 aspect-h-9 relative rounded-lg overflow-hidden">
        {header}
      </div>
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="flex items-center justify-between">
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
            {title}
          </div>
          {icon && (
            <div className="opacity-70 group-hover/bento:opacity-100 transition duration-200">
              {icon}
            </div>
          )}
        </div>
        <div className="font-sans font-normal text-neutral-600 text-sm dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};