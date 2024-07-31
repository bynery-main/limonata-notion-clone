import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export const getWorkspaceDetails = async (workspaceId: string) => {
  try {
    const workspaceRef = doc(db, "workspaces", workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (workspaceSnap.exists()) {
      return { data: workspaceSnap.data(), error: null };
    } else {
      return { data: null, error: 'Workspace not found' };
    }
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error fetching workspace details' };
  }
};
