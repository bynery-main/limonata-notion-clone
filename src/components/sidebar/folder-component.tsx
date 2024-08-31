import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { deleteObject, ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { ChevronRightIcon, FolderPlusIcon, NotebookIcon, UploadIcon, MoreHorizontal, PencilIcon, TrashIcon, MoreVerticalIcon, CheckIcon } from "lucide-react";
import { db, storage } from "@/firebase/firebaseConfig";
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
  deleteFile: (workspaceId: string, folderId: string, fileId: string) => Promise<void>;
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
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const router = useRouter();
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [showFileMenu, setShowFileMenu] = useState<{ [key: string]: boolean }>({});
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameFileName, setRenameFileName] = useState<string>("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(openFolderId === folder.id);
  }, [openFolderId, folder.id]);

  useEffect(() => {
    if (!isOpen) {
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
        setShowFileMenu({});
      }
    };

    if (showMenu || Object.values(showFileMenu).some((show) => show)) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showFileMenu]);

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

  const handleFileClick = (file: FileData) => {
    router.push(`/dashboard/${workspaceId}/${folder.id}/${file.id}`);
  };

  const handleMenuItemClick = (action: () => void) => {
    setShowMenu(false);
    setOpenFolderId(folder.id);
    action();
  };

  const handleRename = async () => {
    if (newName.trim() === "") return;
    const folderRef = doc(db, "workspaces", workspaceId, "folders", folder.id);
    await setDoc(folderRef, { name: newName }, { merge: true });
    setShowRename(false);
  };

  const handleRenameFile = async (fileId: string) => {
    if (renameFileName.trim() === "") return;

    try {
      const fileRef = doc(db, `workspaces/${workspaceId}/folders/${folder.id}/files/${fileId}`);
      const noteRef = doc(db, `workspaces/${workspaceId}/folders/${folder.id}/notes/${fileId}`);
      const fileSnapshot = await getDoc(fileRef);
      const noteSnapshot = await getDoc(noteRef);

      if (fileSnapshot.exists()) {
        // Handle renaming a file in storage
        const oldFileName = fileSnapshot.data()?.name;
        const oldStoragePath = `workspaces/${workspaceId}/folders/${folder.id}/${oldFileName}`;
        const newStoragePath = `workspaces/${workspaceId}/folders/${folder.id}/${renameFileName}`;
        const oldStorageRef = ref(storage, oldStoragePath);
        const newStorageRef = ref(storage, newStoragePath);

        // Get the file data
        const fileData = await getDownloadURL(oldStorageRef);
        const response = await fetch(fileData);
        const blob = await response.blob();

        // Upload the file with the new name
        await uploadBytes(newStorageRef, blob);

        // Update Firestore with the new name
        await updateDoc(fileRef, { name: renameFileName });

        // Delete the old file from storage
        await deleteObject(oldStorageRef);
      } else if (noteSnapshot.exists()) {
        // Handle renaming a note (only in Firestore)
        await updateDoc(noteRef, { name: renameFileName });
      } else {
        console.error("File or note not found in Firestore.");
      }
    } catch (error) {
      console.error("Error renaming file or note:", error);
    }

    setRenameFileId(null);
    setRenameFileName("");
    setShowFileMenu({ ...showFileMenu, [fileId]: false });
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileRef = doc(db, `workspaces/${workspaceId}/folders/${folder.id}/files/${fileId}`);
      const noteRef = doc(db, `workspaces/${workspaceId}/folders/${folder.id}/notes/${fileId}`);
      
      // Attempt to delete as a file first
      try {
        const fileSnapshot = await getDoc(fileRef);
        if (fileSnapshot.exists()) {
          const fileName = fileSnapshot.data()?.name;
          const storagePath = `workspaces/${workspaceId}/folders/${folder.id}/${fileName}`;
          const storageRef = ref(storage, storagePath);
          await deleteObject(storageRef);  // Delete from storage
          await deleteDoc(fileRef);  // Delete from Firestore
        } else {
          // If not found as a file, attempt to delete as a note
          const noteSnapshot = await getDoc(noteRef);
          if (noteSnapshot.exists()) {
            await deleteDoc(noteRef);  // Delete from Firestore
          } else {
            console.error("File or note not found in Firestore.");
          }
        }
      } catch (error) {
        console.error("Error deleting from Firestore or Storage:", error);
      }

      setFolders((prevFolders) =>
        prevFolders.map((f) =>
          f.id === folder.id ? { ...f, files: f.files.filter((file) => file.id !== fileId) } : f
        )
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    }
    setShowFileMenu({ ...showFileMenu, [fileId]: false });
  };

  const handleRenameKeyPress = async (event: React.KeyboardEvent, fileId: string) => {
    if (event.key === "Enter") {
      await handleRenameFile(fileId);
    }
  };

  const getFileEmoji = (fileName: string | undefined) => {
    if (!fileName) return "📝"; // Default emoji for undefined or empty file names
  
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const pdfExtensions = ["pdf"];
    const docExtensions = ["doc", "docx"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac"];
    const videoExtensions = ["mp4", "avi", "mov", "wmv"];
  
    if (imageExtensions.includes(fileExtension || "")) return "🖼️";
    if (pdfExtensions.includes(fileExtension || "")) return "📕";
    if (docExtensions.includes(fileExtension || "")) return "📘";
    if (audioExtensions.includes(fileExtension || "")) return "🎵";
    if (videoExtensions.includes(fileExtension || "")) return "🎥";
    return "📝";
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
            
            {/* File list */}
            <div className="mt-4">
              {folder.files && folder.files.map((file) => (
                <div 
                  key={file.id}
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors duration-200 ${
                    hoveredFileId === file.id ? 'bg-gray-100' : ''
                  }`}
                  onMouseEnter={() => setHoveredFileId(file.id)}
                  onMouseLeave={() => setHoveredFileId(null)}
                >
                  <span className="mr-2" onClick={() => handleFileClick(file)}>{getFileEmoji(file.name)}</span>
                  {renameFileId === file.id ? (
                    <div className="flex items-center flex-grow">
                      <input
                        type="text"
                        value={renameFileName}
                        onChange={(e) => setRenameFileName(e.target.value)}
                        onBlur={() => handleRenameFile(file.id)}
                        onKeyPress={(e) => handleRenameKeyPress(e, file.id)}
                        className="text-sm flex-grow border rounded p-1"
                        title="Rename file"
                      />
                      <button onClick={() => handleRenameFile(file.id)} className="ml-2 text-green-500" aria-label="Rename File">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm flex-grow" onClick={() => handleFileClick(file)}>
                      {file.name || "Unnamed File"}
                    </span>
                  )}
                  <MoreVerticalIcon
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => setShowFileMenu({ ...showFileMenu, [file.id]: !showFileMenu[file.id] })}
                  />
                  {showFileMenu[file.id] && (
                    <div ref={menuRef} className="absolute right-0 mt-8 bg-white border rounded shadow-lg z-10">
                      <button onClick={() => setRenameFileId(file.id)} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
                        <PencilIcon className="h-4 w-4 mr-2" /> Rename
                      </button>
                      <button onClick={() => handleDeleteFile(file.id)} className="p-2 text-red-600 hover:bg-gray-200 w-full text-left flex items-center">
                        <TrashIcon className="h-4 w-4 mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

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
