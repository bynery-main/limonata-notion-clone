// src/services/workspaceService.ts

import { db } from "../../../firebase/firebaseConfig";
import { getDocs, collection, query, where } from "firebase/firestore";

export interface Workspace {
  id: string;
  name: string;
}

export const fetchWorkspaces = async (role: "owners" | "collaborators", userId: string): Promise<Workspace[]> => {
  const workspacesQuery = query(
    collection(db, "workspaces"),
    where(role, "array-contains", userId)
  );
  const workspacesSnapshot = await getDocs(workspacesQuery);

  return workspacesSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name || "Unnamed Workspace",
  }));
};