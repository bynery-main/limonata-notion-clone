import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { collection, doc, setDoc, deleteDoc, getDocs, updateDoc, collectionGroup, query, where, getDoc } from "firebase/firestore";
import { ref, listAll, deleteObject, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";
import { auth } from "@/firebase/firebaseConfig";

export interface FileData {
  id: string;
  name: string;
  url: string;
}

export interface NoteData {
  id: string;
  name: string;
  type: 'note' | 'file';
}

export interface FolderNotes {
  folderId: string;
  folderName: string;
  notes: NoteData[];
}

export interface FlashcardDeck {
  id: string;
  name: string;
}

export const fetchFiles = async (workspaceId: string, folderId: string): Promise<FileData[]> => {
  // Fetch files from Firestore
  const filesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "files");
  const filesSnapshot = await getDocs(filesRef);
  const files: FileData[] = filesSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    url: doc.data().url,
  }));

  // Fetch notes from Firestore (as you had before)
  const notesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "notes");
  const notesSnapshot = await getDocs(notesRef);
  const notes: FileData[] = notesSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    url: ''  // No URL for notes, so set it as an empty string
  }));

  // Combine files and notes into a single array
  const combinedData = [...files, ...notes];
  
  return combinedData;
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

export const addNote = async (workspaceId: string, folderId: string, noteName: string) => {
  if (noteName.trim() === "") return;

  const notesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "notes");
  const newNoteRef = doc(notesRef);

  await setDoc(newNoteRef, { name: noteName });
  console.log(`Created note: ${noteName} in folder: ${folderId}`);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const updateFileContent = async (
  workspaceId: string,
  folderId: string,
  fileId: string,
  content: string
) => {
  if (!workspaceId || !folderId || !fileId) {
    console.log("Missing required parameters for updating file content");
    return;
  }

  const fileDocRef = doc(db, "workspaces", workspaceId, "folders", folderId, "files", fileId);
  await updateDoc(fileDocRef, {
    content,
  });
  console.log(`Updated file content for file: ${fileId}`);
};

export async function findDocumentByFileId(fileId: string) {
  try {
    // Create a query against the collection group
    const docQuery = query(collectionGroup(db, 'files'), where('fileId', '==', fileId));
    
    // Execute the query
    const querySnapshot = await getDocs(docQuery);
    
    // Process the results
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, data: doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error('Error finding document:', error);
    return null;
  }
}

export const fetchAllNotes = async (workspaceId: string): Promise<FolderNotes[]> => {
  const foldersNotes: FolderNotes[] = [];

  // Fetch all folders in the workspace
  const foldersRef = collection(db, "workspaces", workspaceId, "folders");
  const foldersSnapshot = await getDocs(foldersRef);

  // Iterate through each folder and fetch notes
  for (const folderDoc of foldersSnapshot.docs) {
    const notesRef = collection(db, "workspaces", workspaceId, "folders", folderDoc.id, "notes");
    const notesSnapshot = await getDocs(notesRef);

    const notes: NoteData[] = notesSnapshot.docs.map(noteDoc => ({
      id: noteDoc.id,
      name: noteDoc.data().name,
      type: 'note', // Mark this as a note
    }));

    foldersNotes.push({
      folderId: folderDoc.id,
      folderName: folderDoc.data().name,
      notes,
    });
  }

  return foldersNotes;
};

export const fetchAllFiles = async (workspaceId: string): Promise<FolderNotes[]> => {
  const foldersFiles: FolderNotes[] = [];

  // Fetch all folders in the workspace
  const foldersRef = collection(db, "workspaces", workspaceId, "folders");
  const foldersSnapshot = await getDocs(foldersRef);

  // Iterate through each folder and fetch files
  for (const folderDoc of foldersSnapshot.docs) {
    const filesRef = collection(db, "workspaces", workspaceId, "folders", folderDoc.id, "files");
    const filesSnapshot = await getDocs(filesRef);

    const files: NoteData[] = filesSnapshot.docs.map(fileDoc => ({
      id: fileDoc.id,
      name: fileDoc.data().name,
      type: 'file', // Mark this as a file
    }));

    foldersFiles.push({
      folderId: folderDoc.id,
      folderName: folderDoc.data().name,
      notes: files,
    });
  }

  return foldersFiles;
};

export const fetchFlashcardDecks = async (workspaceId: string): Promise<FlashcardDeck[]> => {
  const decks: FlashcardDeck[] = [];
  const decksRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");
  const decksSnapshot = await getDocs(decksRef);

  decksSnapshot.forEach((doc) => {
    decks.push({
      id: doc.id,
      name: doc.data().name,
    });
  });

  return decks;
};

export const getSubscriptionStatus = async (uid: string): Promise<string | null> => {
  try {
    if (!uid) {
      console.error("No user ID provided.");
      return null;
    }

    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document not found.");
      return null;
    }
    
    const userData = userDoc.data();
    console.log("User document found:", userData);
    
    // Return the tier (subscription level) or default to 'free'
    return userData.tier || "free";
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return null;
  }
};
