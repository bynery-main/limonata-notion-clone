import { useMembers, useSpace } from "@ably/spaces/react";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

const OnlineCollaborators = () => {
  const { space } = useSpace();
  const [isEntered, setIsEntered] = useState(false);
  const { self, others } = useMembers();

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

  if (!isEntered) return null;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex -space-x-3">
        {others.map((member, index) => (
          <div
            key={member.connectionId}
            className="relative inline-block"
            style={{ zIndex: others.length - index }}
          >
            {member.profileData?.avatar ? (
              <img
                src={member.profileData.avatar}
                alt={member.profileData?.username || 'Collaborator'}
                className="w-8 h-8 rounded-full border-2 border-white bg-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
        ))}
      </div>
      {others.length > 0 && (
        <span className="text-sm text-gray-500 ml-2">
          {others.length} online
        </span>
      )}
    </div>
  );
};

export default OnlineCollaborators;