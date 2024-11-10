import { Realtime } from "ably";
import Spaces from "@ably/spaces";
import { SpacesProvider, SpaceProvider } from "@ably/spaces/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider/AuthProvider";

const AblySpacesProvider = ({ workspaceId, children }) => {
  const [ably, setAbly] = useState(null);
  const [spaces, setSpaces] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const setupAbly = async () => {
      // Use the user's ID as the clientId if available
      const clientId = user?.uid || `anonymous-${Math.random().toString(36).substr(2, 9)}`;
      
      const ably = new Realtime({ 
        authUrl: '/api/ably-token',
        authMethod: 'GET',
        clientId: clientId
      });
      
      const spaces = new Spaces(ably);
      
      setAbly(ably);
      setSpaces(spaces);
    };

    setupAbly();

    return () => {
      if (ably) {
        ably.close();
      }
    };
  }, [user]);

  if (!spaces) {
    return null;
  }

  return (
    <SpacesProvider client={spaces}>
      <SpaceProvider name={`workspace-${workspaceId}`}>
        {children}
      </SpaceProvider>
    </SpacesProvider>
  );
};

export default AblySpacesProvider;