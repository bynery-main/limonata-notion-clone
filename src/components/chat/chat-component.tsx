"use client";

import React, { useState } from "react";
import GroupChat from "./group-chat";
import ChatButton from "./chat-button";

interface ChatComponentProps {
  workspaceId: string;
  userId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ workspaceId, userId }) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <>
      <GroupChat 
        workspaceId={workspaceId}
        userId={userId}
        isChatVisible={isChatVisible}
        setIsChatVisible={setIsChatVisible}
      />
    </>
  );
};

export default ChatComponent;