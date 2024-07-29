import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { db } from "@/firebase/firebaseConfig";
import * as Accordion from "@radix-ui/react-accordion";
import UploadFile from "./upload-file"; 

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

interface FolderComponentProps {
  folder: Folder;
  parentFolderId?: string;
  workspaceId: string;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  deleteFolder: (workspaceId: string, folderId: string, parentFolderId?: string) => Promise<void>;
  deleteFile: (workspaceId: string, folderId: string, fileName: string) => Promise<void>;
}

const FolderComponent: React.FC<FolderComponentProps> = ({ 
  folder, 
  parentFolderId, 
  workspaceId, 
  setFolders, 
  deleteFolder, 
  deleteFile 
}) => {
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsPressed(!isPressed);
  };

  const addSubFolder = async () => {
    if (newSubFolderName.trim() === "") return;

    const subfoldersRef = collection(
      db,
      "workspaces",
      workspaceId,
      "folders",
      folder.id,
      "subfolders"
    );
    const newSubFolderRef = doc(subfoldersRef);

    await setDoc(newSubFolderRef, {
      name: newSubFolderName,
      contents: [],
    });

    console.log(`Created subfolder: ${newSubFolderName} in folder ${folder.id}`);

    setNewSubFolderName(""); 
  };

  return (
    <Accordion.Item value={folder.id} className="border rounded relative group">
      <Accordion.Trigger className="flex items-center justify-between w-full p-2 text-left" onClick={handleClick}>
        {folder.name}
        <div className="flex items-center gap-2">
          <div>
            <ChevronRightIcon
              className="h-4 w-4"
              style={{ transform: isPressed ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}
            />
          </div>
          <TrashIcon
            className="h-4 w-4 cursor-pointer"
            onClick={() => setShowOptions(!showOptions)}
            style={{ color: isHovered ? "red" : "inherit" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
        </div>
      </Accordion.Trigger>
      {showOptions && (
        <div className="absolute right-0 top-8 bg-white border rounded shadow-md z-10">
          <button onClick={() => deleteFolder(workspaceId, folder.id, parentFolderId)} className="p-2 text-red-600 hover:bg-gray-200 w-full text-left">
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
        <button onClick={addSubFolder} className="bg-blue-500 text-white p-2 rounded mt-2">
          Add Subfolder
        </button>
        <UploadFile
          folderRef={`workspaces/${workspaceId}/folders/${folder.id}`}
          onFileUpload={(file) => {
            setFolders((prevFolders) =>
              prevFolders.map((f) =>
                f.id === folder.id ? { ...f, files: [...f.files, file] } : f
              )
            );
          }}
        />
        <div className="mt-2">
          <h4 className="font-medium">Files</h4>
          <ul>
            {folder.files.map((file) => (
              <li key={file.id} className="flex items-center justify-between">
                <a href={file.url} download className="text-blue-500 hover:underline">
                  {file.name}
                </a>
                <TrashIcon className="h-4 w-4 cursor-pointer text-red-600" onClick={() => deleteFile(workspaceId, folder.id, file.name)} />
              </li>
            ))}
          </ul>
        </div>
        <Accordion.Root type="multiple" className="space-y-2">
          {folder.contents.map((subfolder: Folder) => (
            <FolderComponent
              key={subfolder.id}
              folder={subfolder}
              parentFolderId={folder.id}
              workspaceId={workspaceId}
              setFolders={setFolders}
              deleteFolder={deleteFolder}
              deleteFile={deleteFile}
            />
          ))}
        </Accordion.Root>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default FolderComponent;
