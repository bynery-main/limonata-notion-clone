import { Workspace } from "@/lib/db/workspaces/get-workspaces";
import { motion, AnimatePresence } from "framer-motion";

interface WorkspaceIconProps {
    isActive: boolean;
    workspace: Workspace;
    index?: number;
    onClick: () => void;
    emoji: string | undefined;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    showTooltip: boolean;
  }
  
const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ workspace, index, onClick, isActive, emoji, onMouseEnter, onMouseLeave, showTooltip }) => {
    return (
      <div className="relative inline-block">
        <motion.div
          className={`relative mt-2 mb-2 w-9 h-9 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center text-white font-semibold text-md`}
          onClick={onClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          layout
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
          
          <AnimatePresence>
            {showTooltip && (
              <motion.div 
                className="absolute left-full ml-2 top-[50%] -translate-y-1/2 backdrop-blur-md bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap z-[9999] shadow-lg"
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  } 
                }}
                exit={{ 
                  opacity: 0, 
                  x: -10, 
                  scale: 0.9,
                  transition: { duration: 0.2 } 
                }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { delay: 0.1, duration: 0.2 }
                  }}
                  className="block"
                >
                  {workspace.name}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  export default WorkspaceIcon;