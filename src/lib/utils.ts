import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, listAll, deleteObject, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";

export interface FileData {
  id: string;
  name: string;
  url: string;
}

export const fetchFiles = async (workspaceId: string, folderId: string): Promise<FileData[]> => {
  const filesRef = ref(storage, `workspaces/${workspaceId}/folders/${folderId}`);
  const filesList = await listAll(filesRef);
  const files: FileData[] = await Promise.all(
    filesList.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return { id: itemRef.name, name: itemRef.name, url };
    })
  );
  return files;
};

export const addFolder = async (workspaceId: string, newFolderName: string, parentFolderId?: string) => {
  if (newFolderName.trim() === "") return;

  const foldersRef = parentFolderId
    ? collection(db, "workspaces", workspaceId, "folders", parentFolderId, "subfolders")
    : collection(db, "workspaces", workspaceId, "folders");

  const newFolderRef = doc(foldersRef);

  await setDoc(newFolderRef, { name: newFolderName, contents: [] });
  console.log(`Created folder: ${newFolderName} in ${parentFolderId ? `subfolder of ${parentFolderId}` : "root"}`);
};

export const deleteFolder = async (workspaceId: string, folderId: string, parentFolderId?: string) => {
  const folderRef = parentFolderId
    ? doc(db, "workspaces", workspaceId, "folders", parentFolderId, "subfolders", folderId)
    : doc(db, "workspaces", workspaceId, "folders", folderId);

  await deleteDoc(folderRef);
  console.log(`Deleted folder: ${folderId} from ${parentFolderId ? `subfolder of ${parentFolderId}` : "root"}`);
};

export const deleteFile = async (workspaceId: string, folderId: string, fileName: string) => {
  const fileRef = ref(storage, `workspaces/${workspaceId}/folders/${folderId}/${fileName}`);
  await deleteObject(fileRef);
  console.log(`Deleted file: ${fileName}`);

  const fileDocRef = doc(db, "workspaces", workspaceId, "folders", folderId, "files", fileName);
  await deleteDoc(fileDocRef);
  console.log(`Deleted file entry from Firestore: ${fileName}`);
};


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
