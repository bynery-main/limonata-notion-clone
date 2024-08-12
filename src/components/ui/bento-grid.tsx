import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";

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
  onRename,
  onDelete,
}: {
  className?: string;
  title: string;
  description: string;
  header: React.ReactNode;
  icon?: React.ReactNode;
  href: string;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
}) => {
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.bento-menu')) {
      router.push(href);
    }
  };

  const handleDropdownToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };

  const handleRename = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRename && onRename(href);
    setDropdownVisible(false);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete && onDelete(href);
    setDropdownVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

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
          <div className="flex items-center space-x-2 relative">
            {icon && (
              <div className="opacity-70 group-hover/bento:opacity-100 transition duration-200">
                {icon}
              </div>
            )}
            <MoreHorizontal
              className="h-5 w-5 text-neutral-500 cursor-pointer bento-menu"
              onClick={handleDropdownToggle}
            />
            {dropdownVisible && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                <button
                  onClick={handleRename}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <div className="flex items-center">
                    <PencilIcon className="h-3.5 w-3.5 mr-2"/> Rename
                  </div>
                </button>
                <button
                  onClick={handleDelete}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <div className="flex items-center">
                    <TrashIcon className="h-3.5 w-3.5 mr-2"/> Delete
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="font-sans font-normal text-neutral-600 text-sm dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};