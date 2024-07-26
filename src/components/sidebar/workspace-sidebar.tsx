import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";
import NativeNavigation from "./native-navigation";
import FoldersDropDown from "./folders-dropdown";

interface WorkspaceSidebarProps {
    params: {workspaceId: string};
    className?: string;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
    params, 
    className
}) => {
    return (
        <>
            <NativeNavigation params={params} className={twMerge('my-2', className)} />
            <FoldersDropDown workspaceId={params.workspaceId} />
        </>
    );
}

export default WorkspaceSidebar;