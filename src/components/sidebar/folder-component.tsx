import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc } from "firebase/firestore";
import { ChevronDownIcon, ChevronLeft, ChevronLeftIcon, ChevronRightIcon, CirclePlusIcon, FolderIcon, FolderPlusIcon, MinusIcon, NotebookIcon, PlusCircleIcon, PlusIcon, ToggleLeftIcon, ToggleRight, ToggleRightIcon, TrashIcon, UploadIcon } from "lucide-react";
import { db } from "@/firebase/firebaseConfig";
import { CSSTransition } from 'react-transition-group';
import * as Accordion from "@radix-ui/react-accordion";
import UploadFile from "./upload-file"; 
import CreateNote from "./create-note"; 
import './folder-component.css'; 

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
  isActive: boolean;
  onSelect: () => void;
  openFolderId: string | null;
  setOpenFolderId: (folderId: string | null) => void;
}

const FolderComponent: React.FC<FolderComponentProps> = ({ 
  folder, 
  parentFolderId, 
  workspaceId, 
  setFolders, 
  deleteFolder, 
  deleteFile,
  isActive,
  onSelect,
  openFolderId,
  setOpenFolderId
}) => {

  const router = useRouter();
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };
  const toggleChevron = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (openFolderId === folder.id) {
      setOpenFolderId(null);
    } else {
      setOpenFolderId(folder.id);
    }
    onSelect();
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

  const navigatePage = (accordionId: string, type: string) => {
    if (type === 'folder') {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }
    if (type === 'file') {
      router.push(`/dashboard/${workspaceId}/${folder.id}/${accordionId}`);
    }
  };

  return (
    <Accordion.Item
      value={folder.id}
      className={`border rounded-lg relative group shadow-lg ${isActive ? 'bg-gray-100' : ''}`}
    >
      <Accordion.Trigger
        id="folder"
        className="hover:no-underline p-2 dark:text-muted-foreground text-sm w-full text-left"
        onClick={toggleChevron}
      >
          <div className="flex gap-4 items-center justify-between overflow-hidden">
            <div className="flex items-center gap-2">
              <ChevronRightIcon
                className="h-4 w-4 cursor-pointer"
                style={{ 
                  transform: openFolderId === folder.id ? "rotate(90deg)" : "rotate(0deg)", 
                  transition: "transform 0.3s ease" 
                }}
              />
              <span className="overflow-hidden text-ellipsis">{folder.name}</span>
            </div>
            <TrashIcon
              className="h-4 w-4 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }}
              style={{ color: isHovered ? "red" : "inherit" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
          </div>
        </Accordion.Trigger>
      {showOptions && (
        <div className="absolute right-0 top-8 bg-white border rounded shadow-lg z-10">
          <button onClick={() => deleteFolder(workspaceId, folder.id, parentFolderId)} className="p-2 text-red-600 hover:bg-gray-200 w-full text-left">
            Delete Topic
          </button>
        </div>
      )}
      <Accordion.Content className="p-2 text-gray-500 font-light">
      <div>

      <button onClick={() => setShowAddSubtopic(!showAddSubtopic)} className="flex items-center mt-2">
      <FolderPlusIcon className="h-4 w-4 mx-2" />
        {showAddSubtopic ? 'Hide subtopic' : 'Add a subtopic'}
        {showAddSubtopic ? (
          <MinusIcon className="h-4 w-4 ml-2" />
        ) : (
          <div/>
        )}
      </button>
      <CSSTransition
        in={showAddSubtopic}
        timeout={300}
        classNames="upload"
        unmountOnExit
      >
        <div className="flex center my-2">
          <input
            type="text"
            value={newSubFolderName}
            onChange={(e) => setNewSubFolderName(e.target.value)}
            placeholder="New subtopic name"
            className="border p-2 rounded"
          />
          <button
            onClick={addSubFolder}
            className="bg-transparent text-black p-3 mx-2 rounded hover:bg-blue-500 hover:text-white"
          >
            <CirclePlusIcon className="h-4 w-4" />
          </button>
        </div>
      </CSSTransition>
    </div>
          <div>
          <button onClick={() => setShowUpload(!showUpload)} className="flex items-center my-3">
            <UploadIcon className="h-4 w-4 mx-2" />
        Upload a File
        {showUpload ? (
          <MinusIcon className="h-4 w-4 ml-2" />
        ) : (
          <div/>
        )}
      </button>
      <CSSTransition
          in={showUpload}
          timeout={300}
          classNames="upload"
          unmountOnExit>
            <div className="mx-4">
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
          </div>
      </CSSTransition>
    </div>
    <button onClick={() => setShowCreateNote(!showCreateNote)} className="flex items-center mt-2 mb-2">
        <NotebookIcon className="h-4 w-4 mx-2" />
        Create a Note
        {showCreateNote ? (
          <MinusIcon className="h-4 w-4 ml-2" />
        ) : (
          <div/>
        )}
      </button>
      <CSSTransition
        in={showCreateNote}
        timeout={300}
        classNames="create-note"
        unmountOnExit
      >
        <div className="mx-3">
          <CreateNote workspaceId={workspaceId} folderId={folder.id} />
        </div>
      </CSSTransition>

        {folder.contents.map((subfolder: Folder) => (
          <FolderComponent
            key={subfolder.id}
            folder={subfolder}
            parentFolderId={folder.id}
            workspaceId={workspaceId}
            setFolders={setFolders}
            deleteFolder={deleteFolder}
            deleteFile={deleteFile}
            isActive={isActive}
            onSelect={onSelect}
            openFolderId={openFolderId}
            setOpenFolderId={setOpenFolderId}
            />
          ))}
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default FolderComponent;
