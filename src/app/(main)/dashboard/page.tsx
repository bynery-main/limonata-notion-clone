"use client"

import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem('user');
  const [workspace, setWorkspace] = useState<string | null>(null);

  useEffect(() => {
      const fetchUserData = async () => {
          if (!user && !userSession) {
              router.push('/login');
          } else if (user) {
              const userRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userRef);

              if (userDoc.exists()) {
                  // Check if the 'workspace' collection exists under the user document
                  const workspaceCollectionRef = collection(userRef, "workspace");
                  const workspaceSnapshot = await getDocs(workspaceCollectionRef);
                  
                  if (!workspaceSnapshot.empty) {
                      setWorkspace(workspaceSnapshot.docs.map(doc => doc.id).join(", "));
                  } else {
                      setWorkspace(null);
                  }
              } else {
                  console.error("No document for this user.");
                  setWorkspace(null);
              }
          }
      };

      fetchUserData();
  }, [user, userSession, router]);

  return (
    <div>
    {workspace ? (
      <div>Dashboard: Workspace is {workspace}</div>
    ) : (
      <div
        className="bg-background
        h-screen
        w-screen
        flex
        justify-center
        items-center
        "
      >
        <DashboardSetup userId={user?.uid ?? 'default-uid'} />
      </div>
    )}
  </div>
  );

  router.push('/dashboard/${wokspace.id}');

};

export default Dashboard;