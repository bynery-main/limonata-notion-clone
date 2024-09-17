import { Workspace } from "@/lib/db/workspaces/get-workspaces";
import { motion } from "framer-motion";

interface WorkspaceIconProps {
    isActive: boolean;
    workspace: Workspace;
    index?: number;
    onClick: () => void;
    emoji: string | undefined;
  }
  
const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ workspace, index, onClick, isActive, emoji }) => {
    return (
      <motion.div
        className={`relative mt-2 mb-2 w-9 h-9 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center text-white font-semibold text-md`}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        layout
        title={workspace.name}
      >
        <motion.div
          className={`absolute inset-0 ${isActive ? 'bg-black' : 'bg-[#666666]'}`}
          layoutId={`workspace-bg-${workspace.id}`}
        />
        <motion.div
          className={`absolute inset-0 rounded-lg border-2 ${isActive ? 'border-white' : 'border-transparent'}`}
          layoutId={`workspace-border-${workspace.id}`}
        />
        <motion.span
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {emoji || workspace.name.charAt(0).toUpperCase()}
        </motion.span>
      </motion.div>
    );
  };

  export default WorkspaceIcon;