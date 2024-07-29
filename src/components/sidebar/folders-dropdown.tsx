"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { CirclePlusIcon } from "lucide-react";
import FolderComponent from "./folder-component";
import { fetchFiles, addFolder, deleteFolder, deleteFile } from "@/lib/utils"; 

interface FileData {
  id: string;
  name: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}

interface FoldersDropDownProps {
  workspaceId: string;
}

const FoldersDropDown: React.FC<FoldersDropDownProps> = ({ workspaceId }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    const foldersRef = collection(db, "workspaces", workspaceId, "folders");

    const unsubscribe = onSnapshot(foldersRef, (snapshot) => {
      const fetchFolders = async () => {
        const updatedFolders: Folder[] = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const folderData = doc.data();
            const folderId = doc.id;
            const files = await fetchFiles(workspaceId, folderId);

            return {
              id: folderId,
              name: folderData.name || "Unnamed Folder",
              contents: folderData.contents || [],
              files,
            };
          })
        );
        setFolders(updatedFolders);
      };

      fetchFolders();
    });

    return () => unsubscribe();
  }, [workspaceId]);

  const handleAddFolder = async () => {
    await addFolder(workspaceId, newFolderName);
    setNewFolderName("");
  };

  return (
    <div>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-4 px-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#24222066]">
            Topics
          </h3>
        </div>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New Topic name"
          className="border p-2"
        />
        <button
          onClick={handleAddFolder}
          className="bg-blue-500 text-white p-2 rounded mt-4"
        >
          <CirclePlusIcon className="h-4 w-4 flex items-center justify" />
        </button>
        <Accordion.Root type="multiple" className="space-y-2">
          {folders.map((folder) => (
            <FolderComponent 
              key={folder.id} 
              folder={folder} 
              workspaceId={workspaceId}
              setFolders={setFolders}
              deleteFolder={deleteFolder}
              deleteFile={deleteFile}
            />
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default FoldersDropDown;
