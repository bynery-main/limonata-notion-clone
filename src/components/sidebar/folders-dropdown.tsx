"use client"

import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, CirclePlusIcon, LayoutGridIcon, BoxIcon } from "lucide-react";
import Link from "next/link";

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

  const addFolder = async () => {
    if (newFolderName.trim() === "") return;

    const foldersRef = collection(db, "workspaces", workspaceId, "folders");
    const newFolderRef = doc(foldersRef);

    await setDoc(newFolderRef, {
      name: newFolderName,
      contents: []
    });

    setNewFolderName(""); // Clear the input field after adding the folder
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
        <button onClick={addFolder} className="bg-blue-500 text-white p-2 rounded mt-2">Add Folder</button>
        <Accordion.Root type="multiple" className="space-y-2">
          {folders.map(folder => (
            <Accordion.Item key={folder.id} value={folder.id} className="border rounded">
              <Accordion.Trigger className="flex items-center justify-between w-full p-2 text-left">
                {folder.name}
                <ChevronRightIcon className="h-4 w-4" />
              </Accordion.Trigger>
              <Accordion.Content className="p-2">
                <Accordion.Root type="multiple" className="space-y-2">
                  {folder.contents.map((content, index) => (
                    <Accordion.Item key={index} value={`${folder.id}-${index}`} className="border rounded">
                      <Accordion.Trigger className="flex items-center justify-between w-full p-2 text-left">
                        {content}
                        <ChevronRightIcon className="h-4 w-4" />
                      </Accordion.Trigger>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default FoldersDropDown;
