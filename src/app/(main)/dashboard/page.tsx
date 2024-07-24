"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { useAuth } from "@/components/AuthProvider";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const workspaceCollectionRef = collection(userRef, "workspace");
        const workspaceSnapshot = await getDocs(workspaceCollectionRef);

        if (!workspaceSnapshot.empty) {
          setWorkspace(workspaceSnapshot.docs.map((doc) => doc.id).join(", "));
        } else {
          setWorkspace(null);
        }
      } else {
        console.error("No document for this user.");
        setWorkspace(null);
      }
    };

    if (!loading) {
      fetchUserData();
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // The useEffect will handle redirection
  }

  return (
    <div>
      {workspace ? (
        <div>Dashboard: Workspace is {workspace}</div>
      ) : (
        <div className="bg-background h-screen w-screen flex justify-center items-center">
          <DashboardSetup />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
