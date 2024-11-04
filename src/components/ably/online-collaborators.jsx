import { useMembers } from "@ably/spaces/react";
import { User } from "lucide-react";

const OnlineCollaborators = () => {
  const { others } = useMembers();

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