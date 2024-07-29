"use client"

import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, deleteDoc, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronRightIcon, CirclePlusIcon, TrashIcon } from "lucide-react";
import UploadFile from "./upload-file"; // Import the UploadFile component
import { getStorage, ref, getDownloadURL } from "firebase/storage";

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}

interface FileData {
  id: string;
  name: string;
  url: string;
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
        const updatedFolders: Folder[] = await Promise.all(snapshot.docs.map(async (doc) => {
          const folderData = doc.data();
          const filesCollectionRef = collection(db, "workspaces", workspaceId, "folders", doc.id, "files");
  
          const filesSnapshot = await getFilesSnapshot(filesCollectionRef);
  
          const files: FileData[] = filesSnapshot.docs.map((fileDoc: DocumentData) => ({
            id: fileDoc.id,
            name: fileDoc.data().name,
            url: fileDoc.data().url,
          }));
  
          return {
            id: doc.id,
            name: folderData.name || "Unnamed Folder",
            contents: folderData.contents || [],
            files,
          };
        }));
        setFolders(updatedFolders);
      };
  
      fetchFolders();
    });
  
    return () => unsubscribe();
  }, [workspaceId]);

  const getFilesSnapshot = (filesCollectionRef: any) => {
    return new Promise<QuerySnapshot<DocumentData>>((resolve, reject) => {
      onSnapshot(filesCollectionRef, resolve, reject);
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
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const handleClick = () => {
      setIsPressed(!isPressed);
    };

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
        <Accordion.Trigger className="flex items-center justify-between w-full p-2 text-left" onClick={handleClick}>
          {folder.name}
          <div className="flex items-center gap-2">
          <div >
              <ChevronRightIcon
                className="h-4 w-4"
                style={{
                  transform: isPressed ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>
              <TrashIcon
                className="h-4 w-4 cursor-pointer"
                onClick={() => setShowOptions(!showOptions)}
                style={{ color: isHovered ? 'red' : 'inherit' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              />          
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
          <UploadFile folderRef={`workspaces/${workspaceId}/folders/${folder.id}`} /> {/* Include the UploadFile component */}
          <div className="mt-2">
            <h4 className="font-medium">Files</h4>
            <ul>
              {folder.files.map((file) => (
                <li key={file.id}>
                  <a href={file.url} download className="text-blue-500 hover:underline">
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
        <button onClick={() => addFolder()} className="bg-blue-500 text-white p-2 rounded mt-4"> 
          <CirclePlusIcon className="h-4 w-4 flex items-center justify" />
           </button>
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
