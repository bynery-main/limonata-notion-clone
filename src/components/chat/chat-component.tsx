"use client";

import React, { useState, useEffect } from "react";
import GroupChat from "./group-chat";
import ChatButton from "./chat-button";

interface ChatComponentProps {
  workspaceId: string;
  userId: string;
  defaultOpen?: boolean;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ 
  workspaceId, 
  userId, 
  defaultOpen = false 
}) => {
  const [isChatVisible, setIsChatVisible] = useState(defaultOpen);
  
  // Update visibility when defaultOpen changes
  useEffect(() => {
    if (defaultOpen) {
      setIsChatVisible(true);
    }
  }, [defaultOpen]);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

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