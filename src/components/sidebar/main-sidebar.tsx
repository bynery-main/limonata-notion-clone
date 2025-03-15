import React, { useEffect, useState } from "react";
import { Workspace } from "@/lib/db/workspaces/get-workspaces";
import { useRouter } from "next/navigation";
import { FaPlus, FaCog } from "react-icons/fa";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  onSnapshot,
  collection,
  query,
  where,
  QuerySnapshot,
  DocumentData,
  DocumentChange,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import WorkspaceIcon from "./workspace-icon";
import { User } from "firebase/auth";
import { createPortal } from "react-dom";
import exp from "constants";

interface MainSidebarProps {
  user: User | null;
  setShowDashboardSetup: (show: boolean) => void;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ user, setShowDashboardSetup }) => {
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [collaborativeWorkspaces, setCollaborativeWorkspaces] = useState<
    Workspace[]
  >([]);
  const router = useRouter();
  const [showDS, setShowDS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [workspaceEmojis, setWorkspaceEmojis] = useState<{
    [key: string]: string;
  }>({});
  MainSidebar.displayName = "MainSidebar";
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

        snapshot
          .docChanges()
          .forEach((change: DocumentChange<DocumentData>) => {
            const workspaceData = {
              id: change.doc.id,
              ...change.doc.data(),
            } as Workspace;

            if (change.type === "added" || change.type === "modified") {
              const index = updatedWorkspaces.findIndex(
                (ws) => ws.id === workspaceData.id
              );
              if (index > -1) {
                updatedWorkspaces[index] = workspaceData;
              } else {
                updatedWorkspaces.push(workspaceData);
              }

              getWorkspaceEmoji(workspaceData.id);
            }

            if (change.type === "removed") {
              updatedWorkspaces = updatedWorkspaces.filter(
                (ws) => ws.id !== workspaceData.id
              );
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
        setWorkspaceEmojis((prevEmojis) => ({
          ...prevEmojis,
          [workspaceId]: data.emoji,
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
  };

  const handleSettingsClick = () => {
    router.push(`/settings`);
  };

  const handleOverlayClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      setShowSettings(false);
    }
  };
  const renderDashboardSetupModal = () => {
    const portalElement = document.getElementById('dashboard-setup-portal');
    if (!portalElement) return null;

    return createPortal(
      <AnimatePresence>
        {showDS && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDS(false);
            }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <DashboardSetup
                onCancel={() => setShowDS(false)}
                onSuccess={() => setShowDS(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      portalElement
    );
  };

  return (
    <div className="relative w-[50px] h-screen bg-[#272727] flex flex-col justify-between rounded-tr-3xl z-500">
      <div className="mt-3 flex flex-col items-center">
        <motion.button
          className="w-[37px] h-[37px] bg-[#d14a24ed] rounded-full cursor-pointer mb-2"
          onClick={() => handleWorkspaceClick("home")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="flex items-center justify-center w-[37px] h-[37px] rounded-full overflow-hidden bg-cover bg-[50%_50%] hover:border-2 hover:border-white">
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
        {ownedWorkspaces.length > 0 && collaborativeWorkspaces.length > 0 && (
          <div className="w-[80%] h-[2px] bg-gray-600 my-2 rounded-full"></div>
        )}
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
          className="mt-3 w-8 h-8 bg-[#666666] rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-white text-sm"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowDashboardSetup(true)}
        >
          <FaPlus />
        </motion.div>
      </div>
  
      <div className="flex flex-col items-center pb-2">
        {user && user.photoURL && (
          <>
            <motion.img
              src={user.photoURL}
              alt="Google Profile"
              className="w-8 h-8 rounded-full mt-2 cursor-pointer"
              onClick={handleSettingsClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <motion.div
              className="mt-2 w-8 h-8 bg-[#666666] rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-white text-sm"
              onClick={() => router.push("/settings")}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaCog className="w-4 h-4" />
            </motion.div>
          </>
        )}
      </div>
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute bottom-0 left-12 z-50"
            onClick={handleOverlayClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="relative w-24 bg-white rounded-lg shadow-lg p-2 mb-2">
              <Link href="/settings" passHref>
                <motion.div
                  className="text-black px-3 py-1 hover:bg-gray-200 rounded-md cursor-pointer flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCog className="mr-1" /> Settings
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {renderDashboardSetupModal()}
      </AnimatePresence>
    </div>
  );
}
export default MainSidebar;