"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { Workspace } from "@/lib/db/workspaces/get-workspaces";
import { useRouter } from "next/navigation";
import { FaPlus, FaCog } from "react-icons/fa";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import Link from "next/link";
import { Home } from "lucide-react";
import { onSnapshot, collection, query, where, QuerySnapshot, DocumentData, DocumentChange, doc, getDoc, getFirestore } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

export const MainSidebar = (): JSX.Element => {
  const { user } = useAuth();
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [collaborativeWorkspaces, setCollaborativeWorkspaces] = useState<Workspace[]>([]);
  const router = useRouter();
  const [showDS, setShowDS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [workspaceEmojis, setWorkspaceEmojis] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let unsubscribeOwned: () => void;
    let unsubscribeCollaborated: () => void;

    const loadWorkspaces = () => {
      if (user) {
        const ownedQuery = query(
          collection(db, "workspaces"),
          where("owners", "array-contains", user.uid)
        );
        const collaboratedQuery = query(
          collection(db, "workspaces"),
          where("collaborators", "array-contains", user.uid)
        );

        unsubscribeOwned = onSnapshot(ownedQuery, (snapshot) => {
          handleWorkspaceSnapshot(snapshot, setOwnedWorkspaces);
        });

        unsubscribeCollaborated = onSnapshot(collaboratedQuery, (snapshot) => {
          handleWorkspaceSnapshot(snapshot, setCollaborativeWorkspaces);
        });
      }
    };

    const handleWorkspaceSnapshot = async (
      snapshot: QuerySnapshot<DocumentData>,
      setWorkspaceState: React.Dispatch<React.SetStateAction<Workspace[]>>
    ) => {
      setWorkspaceState((prevWorkspaces) => {
        let updatedWorkspaces = [...prevWorkspaces];

        snapshot.docChanges().forEach((change: DocumentChange<DocumentData>) => {
          const workspaceData = { id: change.doc.id, ...change.doc.data() } as Workspace;

          if (change.type === "added" || change.type === "modified") {
            const index = updatedWorkspaces.findIndex((ws) => ws.id === workspaceData.id);
            if (index > -1) {
              updatedWorkspaces[index] = workspaceData;
            } else {
              updatedWorkspaces.push(workspaceData);
            }
            
            getWorkspaceEmoji(workspaceData.id);
          }

          if (change.type === "removed") {
            updatedWorkspaces = updatedWorkspaces.filter((ws) => ws.id !== workspaceData.id);
          }
        });

        return updatedWorkspaces;
      });
    };

    const getWorkspaceEmoji = async (workspaceId: string) => {
      const workspaceRef = doc(db, "workspaces", workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);
      const data = workspaceSnap.data();
      if (data && data.emoji) {
        setWorkspaceEmojis(prevEmojis => ({
          ...prevEmojis,
          [workspaceId]: data.emoji
        }));
      }
    };

    loadWorkspaces();

    return () => {
      if (unsubscribeOwned) unsubscribeOwned();
      if (unsubscribeCollaborated) unsubscribeCollaborated();
    };
  }, [user]);

  const handleWorkspaceClick = (workspaceId: string) => {
    if (workspaceId === "home") {
      setActiveIcon("home");
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${workspaceId}`);
    }
    setActiveIcon(workspaceId);
    setCurrentWorkspaceId(workspaceId);
  };

  const handleCancel = () => {
    setShowDS(false);
  };

  const handleSuccess = () => {
    setShowDS(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      setShowSettings(false);
    }
  };

  const handleSettingsClick = () => {
    router.push(`/settings`);
  };

  return (
    <motion.div
      className="relative w-14 h-screen bg-[#272727] flex flex-col justify-between"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mt-3 bg-[#272727] flex flex-col items-center">
        <motion.button
          className="w-[34px] h-[34px] bg-[#020039] rounded-full"
          onClick={() => handleWorkspaceClick("home")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full overflow-hidden bg-cover bg-[50%_50%] hover:border-2 hover:border-white">
            <Home className="w-5 h-5 text-white" />
          </div>
        </motion.button>
        {ownedWorkspaces.map((workspace, index) => (
          <WorkspaceIcon
            key={workspace.id}
            isActive={activeIcon === workspace.id}
            workspace={workspace}
            index={index}
            onClick={() => handleWorkspaceClick(workspace.id)}
            emoji={workspaceEmojis[workspace.id]}
          />
        ))}
        <div className="w-full h-px bg-gray-400 my-2"></div>
        {collaborativeWorkspaces.map((workspace, index) => (
          <WorkspaceIcon
            key={workspace.id}
            isActive={activeIcon === workspace.id}
            workspace={workspace}
            index={index}
            onClick={() => handleWorkspaceClick(workspace.id)}
            emoji={workspaceEmojis[workspace.id]}
          />
        ))}
        <motion.div
          className="mt-4 w-10 h-10 bg-[#666666] rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-white text-md"
          onClick={() => setShowDS(true)}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaPlus />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            // whileHover={{ borderColor: "white" }}
          />
        </motion.div>
      </div>
      <div className="flex flex-col items-center pb-4">
        {user && user.photoURL && (
          <>
            <motion.img
              src={user.photoURL}
              alt="Google Profile"
              className="w-10 h-10 rounded-full mt-2 cursor-pointer"
              onClick={handleSettingsClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <motion.div
              className="mt-2 w-10 h-10 bg-[#666666] rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-white text-md"
              onClick={handleSettingsClick}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaCog className="w-5 h-5" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent"
                // whileHover={{ borderColor: "white" }}
              />
            </motion.div>
          </>
        )}
      </div>
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute bottom-0 left-16 z-50"
            onClick={handleOverlayClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="relative w-32 bg-white rounded-lg shadow-lg p-2 mb-2">
              <Link href="/settings" passHref>
                <motion.div
                  className="text-black px-4 py-2 hover:bg-gray-200 rounded-md cursor-pointer flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCog className="mr-2" /> Settings
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDS && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-[#6FA2FF] bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DashboardSetup onCancel={handleCancel} onSuccess={handleSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface WorkspaceIconProps {
  isActive: boolean;
  workspace: Workspace;
  index: number;
  onClick: () => void;
  emoji: string | undefined;
}

const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ workspace, index, onClick, isActive, emoji }) => {
  return (
    <motion.div
      className={`relative mt-4 w-10 h-10 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center text-white font-semibold text-md`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      layout
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
    </motion.div>
  );
};