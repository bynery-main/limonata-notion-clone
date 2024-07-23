"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation"; // Correct the import here
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { getAuth } from "firebase/auth";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [userSession, setUserSession] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<string | null>(null);

  useEffect(() => {
    // Check if window is defined (i.e., running on the client)
    if (typeof window !== "undefined") {

      const user = auth.currentUser;
      setUserSession(user?.uid ?? null);
      console.log("User session:", userSession);
      console.log("User:", user?.email);
    }
  }, []);

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
        <DashboardSetup />
      </div>
    )}
  </div>
  );
};

export default Dashboard;
