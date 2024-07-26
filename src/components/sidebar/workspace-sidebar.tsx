import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";
import NativeNavigation from "./native-navigation";

interface WorkspaceSidebarProps {
    params: {workspaceId: string};
    className?: string;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
    params, 
    className
}) => {
    return (
        <NativeNavigation params={params} className={twMerge('my-2', className)} />
        
    );
}

export default WorkspaceSidebar;