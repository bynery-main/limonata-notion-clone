import { useCursors, useSpace } from "@ably/spaces/react";
import { useEffect, useState, useRef } from "react";
import type { User } from "firebase/auth";
import type { CursorUpdate } from "@ably/spaces";

interface LiveCursorsProps {
  user: User | null;
}

interface CursorData {
  name: string;
  color: string;
}

// Function to generate a consistent color based on user ID
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

const LiveCursors: React.FC<LiveCursorsProps> = ({ user }) => {
  const { space } = useSpace();
  const [isEntered, setIsEntered] = useState(false);
  const userColor = useRef(user ? generateUserColor(user.uid) : '#4F46E5');
  
  useEffect(() => {
    if (!space || isEntered || !user) return;

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
    };
  }, [space, user, isEntered]);

  const { cursors, set: setCursor } = useCursors(update => {
    console.log("Cursor update:", update);
  }, { returnCursors: true });

  useEffect(() => {
    if (!space || !isEntered || !setCursor || !user) return;

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
  }, [space, isEntered, setCursor, user]);

  if (!isEntered || !user) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      {Object.entries(cursors || {}).map(([connectionId, cursorUpdate]) => {
        const position = cursorUpdate?.cursorUpdate?.position;
        const cursorData = cursorUpdate?.cursorUpdate?.data as Partial<CursorData>;
        
        if (!position || connectionId === space?.client.connection.id) return null;
        
        return (
          <div
            key={connectionId}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: position.x,
              top: position.y,
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
                className="drop-shadow-md"
              >
                <path
                  d="M30 20L80 50L30 80Z"
                  stroke="black"
                  strokeWidth="0"
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
          </div>
        );
      })}
    </div>
  );
};

export default LiveCursors;