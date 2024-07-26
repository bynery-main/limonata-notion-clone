"use client"

import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

interface FoldersDropDownProps {
  workspaceId: string;
}

const FoldersDropDown: React.FC<FoldersDropDownProps> = ({ workspaceId }) => {
  const [newFolderName, setNewFolderName] = useState("");

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
    </div>
  );
};

export default FoldersDropDown;
