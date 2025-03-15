"use client";

import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, deleteDoc, query, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { CirclePlusIcon } from "lucide-react";
import FolderComponent from "./folder-component";
import { fetchFiles, addFolder } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface FoldersDropDownProps {
  workspaceId: string;
  onFoldersUpdate: (folders: Folder[]) => void;
  onFolderSelect: (folder: Folder) => void;
  currentFolderId: string | null;
}

const FoldersDropDown: React.FC<FoldersDropDownProps> = ({
  workspaceId,
  onFoldersUpdate,
  currentFolderId,
  onFolderSelect,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    console.log(`Setting up Firestore listener for workspace: ${workspaceId}`);

    const foldersRef = collection(db, "workspaces", workspaceId, "folders");

    const unsubscribe = onSnapshot(foldersRef, async (snapshot) => {
      console.log(`Snapshot received at ${new Date().toISOString()}`);

      const updatedFolders: Folder[] = [];

      for (const change of snapshot.docChanges()) {
        const doc = change.doc;
        const folderData = doc.data();
        const folderId = doc.id;

        if (change.type === "added" || change.type === "modified") {
          const files = await fetchFiles(workspaceId, folderId);
          const updatedFolder: Folder = {
            id: folderId,
            name: folderData.name || "Unnamed Folder",
            contents: folderData.contents || [],
            files,
          };
          updatedFolders.push(updatedFolder);
        }
      }

      setFolders((prevFolders) => {
        const newFolders = prevFolders.filter(
          (folder) =>
            !snapshot.docChanges().some(
              (change) => change.type === "removed" && change.doc.id === folder.id
            )
        );
        updatedFolders.forEach((updatedFolder) => {
          const index = newFolders.findIndex((f) => f.id === updatedFolder.id);
          if (index !== -1) {
            newFolders[index] = updatedFolder;
          } else {
            newFolders.push(updatedFolder);
          }
        });
        
        return newFolders;
      });
    });

    return () => {
      console.log(`Unsubscribing Firestore listener for workspace: ${workspaceId}`);
      unsubscribe();
    };
  }, [workspaceId]);

  useEffect(() => {
    onFoldersUpdate(folders);
  }, [folders, onFoldersUpdate]);

  const handleAddFolder = async () => {
    await addFolder(workspaceId, newFolderName);
    setNewFolderName("");
  };

  const handleDeleteFolder = async (workspaceId: string, folderId: string) => {
    try {
      // Delete all files and subfolders in the folder from Firebase Storage
      const folderStorageRef = ref(storage, `workspaces/${workspaceId}/folders/${folderId}`);
      await deleteFolderContentsRecursively(folderStorageRef);

      // Delete all files and subfolders in the folder from Firestore
      await deleteFolderContentsFromFirestore(workspaceId, folderId);

      // Delete the folder document from Firestore
      const folderRef = doc(db, "workspaces", workspaceId, "folders", folderId);
      await deleteDoc(folderRef);

      // Remove the folder from the local state
      setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId));
    } catch (error) {
      console.error("Error deleting folder and its contents:", error);
    }
  };

  const deleteFolderContentsRecursively = async (folderRef: any) => {
    const folderFiles = await listAll(folderRef);

    // Delete all files in the folder
    for (const itemRef of folderFiles.items) {
      await deleteObject(itemRef);
    }

    // Recursively delete all subfolders and their contents
    for (const prefixRef of folderFiles.prefixes) {
      await deleteFolderContentsRecursively(prefixRef);
    }
  };

  const deleteFolderContentsFromFirestore = async (workspaceId: string, folderId: string) => {
    const filesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "files");
    const filesQuery = query(filesRef);
    const filesSnapshot = await getDocs(filesQuery);

    // Get workspace reference - we'll need this for both file and note cases
    const workspaceRef = doc(db, "workspaces", workspaceId);
    let workspaceDoc = await getDoc(workspaceRef);
    let workspaceCharCount = workspaceDoc.data()?.charCount || 0;

    // Delete all files in the folder
    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();

      if (fileData?.transcript) {
        const transcriptCharCount = fileData.transcript.length;
        workspaceCharCount -= transcriptCharCount;
        console.log(`Subtracting ${transcriptCharCount} characters from transcript`);
      }

      try {
        await deleteDoc(fileDoc.ref);
      } catch (error) {
        console.error("Error deleting file document:", error);
      }

      if (fileData?.transcript) {
        try {
          workspaceCharCount = Math.max(0, workspaceCharCount);
          await updateDoc(workspaceRef, { charCount: workspaceCharCount });
          console.log(`Updated workspace character count after file deletion: ${workspaceCharCount}`);
        } catch (error) {
          console.error("Error updating workspace character count:", error);
        }
      }
    }

    // Delete notes
    const notesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "notes");
    const notesQuery = query(notesRef);
    const notesSnapshot = await getDocs(notesQuery);

    for (const noteDoc of notesSnapshot.docs) {
      // Get the note's text content
      const noteData = noteDoc.data();
      const noteText = noteData.text || "";
      
      // Count characters in the note's text
      const noteCharCount = noteText.length;
      
      // Subtract note's character count from workspace total
      workspaceCharCount -= noteCharCount;

      await deleteDoc(noteDoc.ref);
    }

    workspaceCharCount = Math.max(0, workspaceCharCount);
    await updateDoc(workspaceRef, { charCount: workspaceCharCount })

    // Recursively delete all subfolders and their contents
    const subfoldersRef = collection(db, "workspaces", workspaceId, "folders", folderId, "subfolders");
    const subfoldersQuery = query(subfoldersRef);
    const subfoldersSnapshot = await getDocs(subfoldersQuery);

    for (const subfolderDoc of subfoldersSnapshot.docs) {
      await deleteFolderContentsFromFirestore(workspaceId, subfolderDoc.id);
      await deleteDoc(subfolderDoc.ref);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenFolderId(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFolderSelect = (folder: Folder) => {
    onFolderSelect(folder);
    setOpenFolderId(folder.id);
  };

  return (
    <div className="w-full max-w-xs" ref={dropdownRef}>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-4 px-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#24222066]">
            Topics
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New Topic Name"
            className="bg-gray-100 h-8 rounded-xl flex-grow pl-3 focus:outline-none"
          />
          <motion.div
            onClick={handleAddFolder}
            className="bg-white text-gray-400 cursor-pointer p-2 rounded hover:text-[#F6B144]"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Add new folder"
          >
            <CirclePlusIcon className="h-4 w-4 " />
          </motion.div>
        </div>
        <div className="space-y-2 overflow-visible">
          {folders.map((folder) => (
            <FolderComponent
              key={folder.id}
              folder={folder}
              workspaceId={workspaceId}
              setFolders={setFolders}
              deleteFolder={handleDeleteFolder}
              deleteFile={handleDeleteFolder}
              isActive={folder.id === currentFolderId}
              onSelect={() => handleFolderSelect(folder)}
              openFolderId={openFolderId}
              setOpenFolderId={setOpenFolderId}
              parentFolderId={undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoldersDropDown;