// src/components/ably/online-collaborators.tsx

import { useMembers, useSpace } from "@ably/spaces/react";
import { useEffect, useState } from "react";
import { User as LucideUser } from "lucide-react";
import type { SpaceMember, ProfileData } from "@ably/spaces";
import { User } from "firebase/auth";

interface UserProfile {
  uid: string;
  email?: string;
  photoURL?: string | null;
  displayName?: string | null;
}

interface OnlineCollaboratorsProps {
  user: User | null;
}

// Adapter function to convert Firebase User to UserProfile
const adaptUserToProfile = (user: User | null): UserProfile | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || undefined, // Convert null to undefined
    photoURL: user.photoURL,
    displayName: user.displayName,
  };
};

const OnlineCollaborators: React.FC<OnlineCollaboratorsProps> = ({ user }) => {
  const { space } = useSpace();
  const [isEntered, setIsEntered] = useState(false);
  const { self, others } = useMembers();
  const userProfile = adaptUserToProfile(user);

  useEffect(() => {
    if (!space || isEntered || !userProfile) return;

    const enterSpace = async () => {
      try {
        await space.enter({
          username: userProfile.displayName || userProfile.email || 'Anonymous',
          avatar: userProfile.photoURL || undefined,
          email: userProfile.email,
          userId: userProfile.uid
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
  }, [space, userProfile, isEntered]);

  if (!isEntered || !userProfile) return null;

  // Rest of the component remains the same...
  const renderMemberAvatar = (member: SpaceMember, name: string) => {
    const avatarUrl = (member.profileData as ProfileData)?.avatar as string | undefined;
    
    return avatarUrl ? (
      <div className="relative">
        <img
          src={avatarUrl}
          alt={name}
          className="w-8 h-8 rounded-full border-2 border-white bg-white object-cover"
        />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {name}
        </div>
      </div>
    ) : (
      <div className="relative">
        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
          <LucideUser className="w-4 h-4 text-gray-500" />
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {name}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-1 mx-4">
      <div className="flex -space-x-3">
        {others.map((member, index) => {
          const memberName = (member.profileData as ProfileData)?.username as string || 
                           (member.profileData as ProfileData)?.email as string || 
                           'Anonymous';
          
          return (
            <div
              key={member.connectionId}
              className="relative inline-block group"
              style={{ zIndex: others.length - index }}
            >
              {renderMemberAvatar(member, memberName)}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          );
        })}
      </div>
      {others.length > 0 && (
        <span className="text-sm text-gray-500 ml-2">
          {others.length} online
        </span>
      )}
      
      {/* Current user avatar */}
      <div className="ml-4 relative group">
        <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
          {userProfile.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt={userProfile.displayName || 'Me'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <LucideUser className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {userProfile.displayName || userProfile.email || 'Me'} (You)
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
      </div>
    </div>
  );
};

export default OnlineCollaborators;