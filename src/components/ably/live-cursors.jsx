import { useCursors, useMembers, useSpace } from "@ably/spaces/react";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

const LiveCursors = () => {
  const { space } = useSpace();
  const { self } = useMembers();
  const [isEntered, setIsEntered] = useState(false);
  
  // Handle entering the space
  useEffect(() => {
    if (!space || isEntered) return;

    const enterSpace = async () => {
      try {
        await space.enter({
          username: self?.connectionId || 'Anonymous',
          avatar: self?.profileData?.avatar
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
  }, [space, self, isEntered]);

  // Only set up cursors after entering the space
  const { cursors, set: setCursor } = useCursors((cursorUpdate) => {
    console.log("Cursor update:", cursorUpdate);
  }, { returnCursors: true });

  // Handle mouse movements
  useEffect(() => {
    if (!space || !isEntered) return;

    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const { scrollX, scrollY } = window;
      
      setCursor({
        position: {
          x: clientX + scrollX,
          y: clientY + scrollY
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [space, isEntered, setCursor]);

  if (!isEntered) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {Object.entries(cursors || {}).map(([connectionId, cursor]) => {
        if (!cursor.position || connectionId === self?.connectionId) return null;
        
        return (
          <div
            key={connectionId}
            className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: cursor.position.x,
              top: cursor.position.y,
              zIndex: 50,
            }}
          >
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-500"
              >
                <path
                  d="M0.842129 0.640625L15.0421 7.24063C15.6421 7.54063 15.6421 8.34063 15.0421 8.64063L0.842129 15.2406C0.242129 15.5406 -0.357871 15.0406 0.142129 14.4406L3.94213 8.54063C4.14213 8.24063 4.14213 7.84063 3.94213 7.54063L0.142129 1.44063C-0.357871 0.840625 0.242129 0.340625 0.842129 0.640625Z"
                  fill="currentColor"
                />
              </svg>
              <div className="absolute left-5 top-2 px-3 py-1 bg-blue-500 text-white text-sm rounded whitespace-nowrap shadow-lg">
                {cursor.clientId?.split('-')[1] || 'Anonymous'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveCursors;