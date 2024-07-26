import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

interface NativeNavigationProps {
    params: {workspaceId: string};
    className?: string;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
    params, 
    className
}) => {
    return (
        <nav className={twMerge('my-2', className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            className="group/native
            flex
            text-Neutrals/neutrals-7
            transition-all
            gap-2
          "
            href={`/dashboard/${params.workspaceId}`}
          >
            <span>My Workspace</span>
          </Link>
        </li>

        {/* <Settings>
          <li
            className="group/native
            flex
            text-Neutrals/neutrals-7
            transition-all
            gap-2
            cursor-pointer
          "
          >
            <span>Settings</span>
          </li>
        </Settings>

        <Trash>
          <li
            className="group/native
            flex
            text-Neutrals/neutrals-7
            transition-all
            gap-2
          "
          >
            <span>Trash</span>
          </li>
        </Trash> */}
      </ul>
    </nav>
    );
}

export default NativeNavigation;