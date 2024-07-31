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

export const getFolderDetails = async (folderId: string) => {
  try {
    const folderRef = doc(db, "folders", folderId);
    const folderSnap = await getDoc(folderRef);

    if (folderSnap.exists()) {
      return { data: folderSnap.data(), error: null };
    } else {  
      return { data: null, error: 'Folder not found' };
    }
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error fetching folder details' };
  }
};

export const getFileDetails = async (fileId: string) => {
  try {
    const fileRef = doc(db, "files", fileId);
    const fileSnap = await getDoc(fileRef);

    if (fileSnap.exists()) {
      return { data: fileSnap.data(), error: null };
    } else {
      return { data: null, error: 'File not found' };
    }
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error fetching file details' };
  }
};
