import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc } from "firebase/firestore";
import { ChevronRightIcon, FolderPlusIcon, NotebookIcon, UploadIcon, MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
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
  const [showMenu, setShowMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(openFolderId === folder.id);
  }, [openFolderId, folder.id]);

  useEffect(() => {
    if (!isOpen) {
      // Reset all temporary items when folder is closed
      setShowAddSubtopic(false);
      setShowUpload(false);
      setShowCreateNote(false);
      setShowRename(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setOpenFolderId(null);
      router.push(`/dashboard/${workspaceId}`);
    } else {
      setOpenFolderId(folder.id);
    }
    onSelect();
  };

  const handleMenuItemClick = (action: () => void) => {
    setShowMenu(false);
    setOpenFolderId(folder.id);
    action();
  };

  const addSubFolder = async () => {
    if (newSubFolderName.trim() === "") return;
    const subfoldersRef = collection(db, "workspaces", workspaceId, "folders", folder.id, "subfolders");
    const newSubFolderRef = doc(subfoldersRef);
    await setDoc(newSubFolderRef, { name: newSubFolderName, contents: [] });
    setNewSubFolderName(""); 
    setShowAddSubtopic(false);
  };

  const handleRename = async () => {
    if (newName.trim() === "") return;
    const folderRef = doc(db, "workspaces", workspaceId, "folders", folder.id);
    await setDoc(folderRef, { name: newName }, { merge: true });
    setShowRename(false);
  };

  return (
    <Accordion.Item
      value={folder.id}
      className={`border rounded-lg relative group hover:shadow-lg ${isActive ? 'bg-gray-100 shadow-xl' : ''}`}
    >
      <Accordion.Trigger
        id="folder"
        className="hover:no-underline p-2 dark:text-muted-foreground text-sm w-full text-left"
        onClick={toggleFolder}
      >
        <div className="flex gap-4 items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2">
            <ChevronRightIcon
              className="h-4 w-4 cursor-pointer"
              style={{ 
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", 
                transition: "transform 0.3s ease" 
              }}
            />
            <span className="overflow-hidden text-ellipsis">{folder.name}</span>
          </div>
          <MoreHorizontal
            className="h-4 w-4 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          />
        </div>
      </Accordion.Trigger>
      {showMenu && (
        <div ref={menuRef} className="absolute right-0 top-8 bg-white border rounded shadow-lg z-10">
          <button onClick={() => handleMenuItemClick(() => setShowRename(true))} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <PencilIcon className="h-4 w-4 mr-2" /> Rename
          </button>
          <button onClick={() => handleMenuItemClick(() => setShowAddSubtopic(true))} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <FolderPlusIcon className="h-4 w-4 mr-2" /> Add Subtopic
          </button>
          <button onClick={() => handleMenuItemClick(() => setShowCreateNote(true))} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <NotebookIcon className="h-4 w-4 mr-2" /> Create Note
          </button>
          <button onClick={() => handleMenuItemClick(() => setShowUpload(true))} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <UploadIcon className="h-4 w-4 mr-2" /> Upload File
          </button>
          <button onClick={() => { deleteFolder(workspaceId, folder.id, parentFolderId); setShowMenu(false); }} className="p-2 text-red-600 hover:bg-gray-200 w-full text-left flex items-center">
            <TrashIcon className="h-4 w-4 mr-2" /> Delete Topic
          </button>
        </div>
      )}
      <Accordion.Content className="p-2 text-gray-500 font-light">
        {isOpen && (
          <>
            <CSSTransition in={showRename} timeout={300} classNames="rename" unmountOnExit>
              <div className="flex center my-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New folder name"
                  className="border p-2 rounded"
                />
                <button
                  onClick={handleRename}
                  className="bg-transparent text-black p-3 mx-2 rounded hover:bg-blue-500 hover:text-white"
                >
                  Rename
                </button>
              </div>
            </CSSTransition>
            <CSSTransition in={showAddSubtopic} timeout={300} classNames="add-subtopic" unmountOnExit>
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
                  Add
                </button>
              </div>
            </CSSTransition>
            <CSSTransition in={showUpload} timeout={300} classNames="upload" unmountOnExit>
              <div className="mx-4">
                <UploadFile
                  folderRef={`workspaces/${workspaceId}/folders/${folder.id}`}
                  onFileUpload={(file) => {
                    setFolders((prevFolders) =>
                      prevFolders.map((f) =>
                        f.id === folder.id ? { ...f, files: [...f.files, file] } : f
                      )
                    );
                    setShowUpload(false);
                  }}
                />
              </div>
            </CSSTransition>
            <CSSTransition in={showCreateNote} timeout={300} classNames="create-note" unmountOnExit>
              <div className="mx-3">
                <CreateNote 
                  workspaceId={workspaceId} 
                  folderId={folder.id} 
                  onNoteCreated={() => setShowCreateNote(false)}
                />
              </div>
            </CSSTransition>
            {/* Here you can add permanent items */}
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
          </>
        )}
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default FolderComponent;