"use client"

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

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
      <input
        type="text"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="New folder name"
      />
      <button onClick={addFolder}>Add Folder</button>
      {folders.map(folder => (
        <div key={folder.id}>
          <h3>{folder.name}</h3>
          <ul>
            {folder.contents.map((content, index) => (
              <li key={index}>{content}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FoldersDropDown;
