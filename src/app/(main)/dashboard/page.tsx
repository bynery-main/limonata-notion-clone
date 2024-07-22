"use client"

import React from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";

async function fetchData() {
  const querySnapshot = await getDocs(collection(db, ""));
}

const Dashboard = () => {

    const [user] = useAuthState(auth);
    const router = useRouter();
    const userSession = sessionStorage.getItem('user');
  
    if (!user && !userSession) {
      return router.push('/login');
    }

    

    return (
        <div>
        Dashboard
        </div>
    );
}

export default Dashboard;