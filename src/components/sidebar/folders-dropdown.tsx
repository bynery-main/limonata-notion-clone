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
  onFoldersUpdate: (folders: Folder[]) => void;
  onFolderSelect: (folder: Folder) => void;
  currentFolderId: string | null;
}

const FoldersDropDown: React.FC<FoldersDropDownProps> = ({
  workspaceId,
  onFoldersUpdate,
  currentFolderId,
  onFolderSelect, }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [newFolderName, setNewFolderName] = useState("");
    const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  useEffect(() => {
    const foldersRef = collection(db, 'workspaces', workspaceId, 'folders');
  
    const unsubscribe = onSnapshot(foldersRef, (snapshot) => {
      const fetchFolders = async () => {
        const updatedFolders: Folder[] = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const folderData = doc.data();
            const folderId = doc.id;
            const files = await fetchFiles(workspaceId, folderId);
  
            return {
              id: folderId,
              name: folderData.name || 'Unnamed Folder',
              contents: folderData.contents || [],
              files,
            };
          })
        );
  
        setFolders(updatedFolders);
        onFoldersUpdate(updatedFolders);  // Call the callback whenever folders are updated
      };
  
      fetchFolders();
    });

    return () => unsubscribe();
  }, [workspaceId, onFoldersUpdate]);


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
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New Topic name"
            className="border p-2 rounded flex-grow"
          />
          <button
            onClick={handleAddFolder}
            className="bg-white text-black p-2 rounded hover:bg-blue-500 hover:text-white"
          >
            <CirclePlusIcon className="h-4 w-4" />
          </button>
        </div>
        <Accordion.Root 
          type="single" 
          value={openFolderId || undefined} 
          onValueChange={(value) => setOpenFolderId(value)}
          className="space-y-2"
        >
        {folders.map((folder) => (
            <FolderComponent
              key={folder.id}
              folder={folder}
              workspaceId={workspaceId}
              setFolders={setFolders}
              deleteFolder={deleteFolder}
              deleteFile={deleteFile}
              isActive={folder.id === currentFolderId}
              onSelect={() => onFolderSelect(folder)}
              openFolderId={openFolderId}
              setOpenFolderId={setOpenFolderId}
            />
        ))}
      </Accordion.Root>
      </div>
    </div>
  );
};

export default FoldersDropDown;
