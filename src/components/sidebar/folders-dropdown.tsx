"use client"

import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, CirclePlusIcon, FlipVerticalIcon } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  contents: any[];
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
      const updatedFolders: Folder[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Folder", // Ensure the name property is included
        contents: doc.data().contents || [] // Ensure contents is included
      }) as Folder);
      setFolders(updatedFolders);
    });

    return () => unsubscribe();
  }, [workspaceId]);

  const addFolder = async (parentFolderId?: string) => {
    if (newFolderName.trim() === "") return;

    const foldersRef = parentFolderId 
      ? collection(db, "workspaces", workspaceId, "folders", parentFolderId, "subfolders")
      : collection(db, "workspaces", workspaceId, "folders");

    const newFolderRef = doc(foldersRef);

    await setDoc(newFolderRef, {
      name: newFolderName,
      contents: []
    });

    console.log(`Created folder: ${newFolderName} in ${parentFolderId ? `subfolder of ${parentFolderId}` : "root"}`);
    
    setNewFolderName(""); // Clear the input field after adding the folder
  };

  const deleteFolder = async (folderId: string, parentFolderId?: string) => {
    const folderRef = parentFolderId 
      ? doc(db, "workspaces", workspaceId, "folders", parentFolderId, "subfolders", folderId)
      : doc(db, "workspaces", workspaceId, "folders", folderId);

    await deleteDoc(folderRef);
    console.log(`Deleted folder: ${folderId} from ${parentFolderId ? `subfolder of ${parentFolderId}` : "root"}`);
  };

  const FolderComponent: React.FC<{ folder: Folder, parentFolderId?: string }> = ({ folder, parentFolderId }) => {
    const [newSubFolderName, setNewSubFolderName] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    const addSubFolder = async () => {
      if (newSubFolderName.trim() === "") return;

      const subfoldersRef = collection(db, "workspaces", workspaceId, "folders", folder.id, "subfolders");
      const newSubFolderRef = doc(subfoldersRef);

      await setDoc(newSubFolderRef, {
        name: newSubFolderName,
        contents: []
      });

      console.log(`Created subfolder: ${newSubFolderName} in folder ${folder.id}`);

      setNewSubFolderName(""); // Clear the input field after adding the folder
    };

    return (
      <Accordion.Item value={folder.id} className="border rounded relative group">
        <Accordion.Trigger className="flex items-center justify-between w-full p-2 text-left">
          {folder.name}
          <div className="flex items-center gap-2">
            <ChevronRightIcon className="h-4 w-4" />
            <FlipVerticalIcon className="h-4 w-4 cursor-pointer" onClick={() => setShowOptions(!showOptions)} />
          </div>
        </Accordion.Trigger>
        {showOptions && (
          <div className="absolute right-0 top-8 bg-white border rounded shadow-md z-10">
            <button 
              onClick={() => deleteFolder(folder.id, parentFolderId)}
              className="p-2 text-red-600 hover:bg-gray-200 w-full text-left"
            >
              Delete Topic
            </button>
          </div>
        )}
        <Accordion.Content className="p-2">
          <input
            type="text"
            value={newSubFolderName}
            onChange={(e) => setNewSubFolderName(e.target.value)}
            placeholder="New subfolder name"
            className="border p-2 rounded"
          />
          <button onClick={addSubFolder} className="bg-blue-500 text-white p-2 rounded mt-2">Add Subfolder</button>
          <Accordion.Root type="multiple" className="space-y-2">
            {folder.contents.map((subfolder: Folder) => (
              <FolderComponent key={subfolder.id} folder={subfolder} parentFolderId={folder.id} />
            ))}
          </Accordion.Root>
        </Accordion.Content>
      </Accordion.Item>
    );
  };

  return (
    <div>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-4 px-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#24222066]">Topics</h3>
        </div>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New Topic name"
          className="border p-2" // Added "rounded" class
        />
        <button onClick={() => addFolder()} className="bg-blue-500 text-white p-2 rounded mt-4"> <CirclePlusIcon className="h-4 w-4 flex items-center justify" /> </button>
        <Accordion.Root type="multiple" className="space-y-2">
          {folders.map(folder => (
            <FolderComponent key={folder.id} folder={folder} />
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default FoldersDropDown;
