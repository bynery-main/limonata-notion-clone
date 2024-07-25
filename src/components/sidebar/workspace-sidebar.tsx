import React from "react";

interface WorkspaceSidebarProps {
    params: {workspaceId: string};
    className?: string;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({params, className}) => {
    return (
        <div>WorkspaceSidebar</div>
    );
}

export default WorkspaceSidebar;