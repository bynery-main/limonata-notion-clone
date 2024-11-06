import { useCursors, useSpace } from "@ably/spaces/react";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import type { User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

interface LiveCursorsProps {
  user: User | null;
  workspaceId: string;
}

interface CursorData {
  name: string;
  color: string;
}

interface CursorPosition {
  x: number;
  y: number;
}

const generateUserColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const LiveCursors: React.FC<LiveCursorsProps> = ({ user, workspaceId }) => {
  const { space } = useSpace();
  const [isEntered, setIsEntered] = useState(false);
  const userColor = useRef(user ? generateUserColor(user.uid) : '#4F46E5');
  const pathname = usePathname();
  const [activeCursors, setActiveCursors] = useState<Map<string, { timestamp: number; data: any }>>(new Map());
  const cursorTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Only show cursors on the main workspace page
  const shouldShowCursors = pathname === `/dashboard/${workspaceId}`;

  useEffect(() => {
    if (!space || isEntered || !user || !shouldShowCursors) return;

    const enterSpace = async () => {
      try {
        await space.enter({
          username: user.displayName || user.email || 'Anonymous',
          avatar: user.photoURL || undefined,
          email: user.email,
          userId: user.uid
        });
        setIsEntered(true);
      } catch (error) {
        console.error('Error entering space:', error);
      }
    };

    enterSpace();

    return () => {
      if (space && isEntered) {
        space.leave().catch(console.error);
      }
      // Clear all timeouts on unmount
      cursorTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [space, user, isEntered, shouldShowCursors]);

  const { cursors, set: setCursor } = useCursors(update => {
    const connectionId = update.connectionId;
    setActiveCursors(prev => {
      const newMap = new Map(prev);
      newMap.set(connectionId, {
        timestamp: Date.now(),
        data: update
      });
      return newMap;
    });

    // Clear existing timeout for this cursor
    if (cursorTimeoutRef.current.has(connectionId)) {
      clearTimeout(cursorTimeoutRef.current.get(connectionId));
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setActiveCursors(prev => {
        const newMap = new Map(prev);
        newMap.delete(connectionId);
        return newMap;
      });
    }, 1000); // Cursor disappears after 1 second of inactivity

    cursorTimeoutRef.current.set(connectionId, timeout);
  }, { returnCursors: true });

  useEffect(() => {
    if (!space || !isEntered || !setCursor || !user || !shouldShowCursors) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { scrollX, scrollY } = window;
      
      setCursor({
        position: {
          x: clientX + scrollX,
          y: clientY + scrollY
        },
        data: {
          name: user.displayName || user.email || 'Anonymous',
          color: userColor.current
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [space, isEntered, setCursor, user, shouldShowCursors]);

  if (!isEntered || !user || !shouldShowCursors) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      <AnimatePresence>
        {Array.from(activeCursors.entries()).map(([connectionId, { data }]) => {
          if (connectionId === space?.client.connection.id) return null;
          const position = data.position as CursorPosition;
          const cursorData = data.data as CursorData;
          
          return (
            <motion.div
              key={connectionId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: position.x,
                y: position.y,
              }}
              exit={{ 
                opacity: 0, 
                scale: 0,
                transition: { duration: 0.2 } 
              }}

            >
              <div className="relative">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ 
                    color: cursorData?.color || '#4F46E5',
                  }}
                  className="drop-shadow-xl"
                >
                  <path
                    d="M30 20L80 50L30 80Z"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    fill="currentColor"
                  />
                </svg>
                <div 
                  className="absolute left-5 top-6 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
                  style={{ 
                    backgroundColor: cursorData?.color || '#4F46E5',
                  }}
                >
                  {cursorData?.name || 'Anonymous'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default LiveCursors;