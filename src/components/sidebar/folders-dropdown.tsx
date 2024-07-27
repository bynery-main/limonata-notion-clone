"use client"

import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, CirclePlusIcon } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  contents: Folder[]; // Update contents type to Folder[]
}

interface FoldersDropDownProps {
  workspaceId: string;
}

const FoldersDropDown: React.FC<FoldersDropDownProps> = ({ workspaceId }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      const foldersRef = collection(db, "workspaces", workspaceId, "folders");
      const unsubscribe = onSnapshot(foldersRef, (snapshot) => {
        const updatedFolders: Folder[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Folder", // Ensure the name property is included
          contents: [] // Initialize contents as an empty array
        }) as Folder);
        setFolders(updatedFolders);

        // Fetch subfolders for each folder
        updatedFolders.forEach(folder => {
          fetchSubfolders(folder.id, folder.id);
        });
      });
      return unsubscribe;
    };

    fetchFolders();
  }, [workspaceId]);

  const fetchSubfolders = (folderId: string, parentFolderId?: string) => {
    const subfoldersRef = collection(db, "workspaces", workspaceId, "folders", folderId, "subfolders");
    onSnapshot(subfoldersRef, (snapshot) => {
      const subfolders: Folder[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Folder",
        contents: []
      }) as Folder);
      setFolders(prevFolders => updateFolderContents(prevFolders, folderId, subfolders));
    });
  };

  const updateFolderContents = (folders: Folder[], folderId: string, contents: Folder[]): Folder[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, contents };
      } else {
        return { ...folder, contents: updateFolderContents(folder.contents, folderId, contents) };
      }
    });
  };

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

  const FolderComponent: React.FC<{ folder: Folder, parentFolderId?: string }> = ({ folder, parentFolderId }) => {
    const [newSubFolderName, setNewSubFolderName] = useState("");

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
      <Accordion.Item value={folder.id} className="border rounded">
        <Accordion.Trigger className="flex items-center justify-between w-full p-2 text-left">
          {folder.name}
          <ChevronRightIcon className="h-4 w-4" />
        </Accordion.Trigger>
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
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#24222066]">Folders</h3>
        </div>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
          className="border p-2 rounded"
        />
        <button onClick={() => addFolder()} className="bg-blue-500 text-white p-2 rounded mt-2">Add Folder</button>
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
