import React from "react";

interface SidebarProps {
    params: {workspaceId: string};
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({params, className}) => {
    return (
        <div>Sidebar</div>
    );
}

export default Sidebar;