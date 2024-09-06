import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc, deleteDoc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { deleteObject, ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { ChevronRightIcon, FolderPlusIcon, NotebookIcon, UploadIcon, MoreHorizontal, PencilIcon, TrashIcon, MoreVerticalIcon, CheckIcon } from "lucide-react";
import { db, storage } from "@/firebase/firebaseConfig";
import { CSSTransition } from 'react-transition-group';
import { fetchFiles } from "@/lib/utils";
import * as Accordion from "@radix-ui/react-accordion";
import UploadFile from "./upload-file";
import CreateNote from "./create-note";
import './folder-component.css';

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
  const [showMenu, setShowMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [showFileMenu, setShowFileMenu] = useState<{ [key: string]: boolean }>({});
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameFileName, setRenameFileName] = useState<string>("");
  const [files, setFiles] = useState<FileData[]>([]); // New state variable for files and notes
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(openFolderId === folder.id);
  }, [openFolderId, folder.id]);

  useEffect(() => {
    if (!isOpen) {
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

  useEffect(() => {
    const fetchAndSetFiles = async () => {
      const fetchedFiles = await fetchFiles(workspaceId, folder.id);
      setFiles(fetchedFiles);
    };

    fetchAndSetFiles();

    // Set up a real-time listener for files and notes
    const filesRef = collection(db, "workspaces", workspaceId, "folders", folder.id, "files");
    const notesRef = collection(db, "workspaces", workspaceId, "folders", folder.id, "notes");

    const unsubscribeFiles = onSnapshot(filesRef, () => fetchAndSetFiles());
    const unsubscribeNotes = onSnapshot(notesRef, () => fetchAndSetFiles());

    return () => {
      unsubscribeFiles();
      unsubscribeNotes();
    };
  }, [workspaceId, folder.id]);

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
        const oldFileExtension = oldFileName.split('.').pop()?.toLowerCase();

        // Check if the new name ends with the correct extension
        let newFileName = renameFileName;
        if (!newFileName.toLowerCase().endsWith(`.${oldFileExtension}`)) {
          newFileName = `${newFileName}.${oldFileExtension}`;
        }

        const oldStoragePath = `workspaces/${workspaceId}/folders/${folder.id}/${oldFileName}`;
        const newStoragePath = `workspaces/${workspaceId}/folders/${folder.id}/${newFileName}`;
        const oldStorageRef = ref(storage, oldStoragePath);
        const newStorageRef = ref(storage, newStoragePath);

        // Get the file data
        const fileData = await getDownloadURL(oldStorageRef);
        const response = await fetch(fileData);
        const blob = await response.blob();

        // Upload the file with the new name
        await uploadBytes(newStorageRef, blob);

        // Get the new URL
        const newUrl = await getDownloadURL(newStorageRef);

        // Update Firestore with the new name and URL
        await updateDoc(fileRef, {
          name: newFileName,
          url: newUrl
        });

        // Delete the old file from storage
        await deleteObject(oldStorageRef);

        // Update the state to reflect the new file name
        setFiles(prevFiles =>
          prevFiles.map(file =>
            file.id === fileId ? { ...file, name: newFileName } : file
          )
        );
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

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
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
    <div className="relative w-64">
      <div className={`overflow-visible break-words border border-gray-300 rounded-lg ${isActive ? 'bg-gray-100' : ''}`}>
        <Accordion.Item value={folder.id}>
          <Accordion.Trigger
            className="hover:no-underline p-2 dark:text-muted-foreground text-sm w-full text-left"
            onClick={toggleFolder}
          >
            <div className="flex items-center justify-between overflow-visible">
              <div className="flex items-center gap-2 flex-grow min-w-0">
                <ChevronRightIcon
                  className="h-4 w-4 cursor-pointer flex-shrink-0"
                  style={{ 
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", 
                    transition: "transform 0.3s ease" 
                  }}
                />
                <span className="truncate w-full flex-grow overflow-visible break-words">{folder.name}</span> 
              </div>
              <div 
                className="p-2 cursor-pointer flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            </div>
          </Accordion.Trigger>
          
          <Accordion.Content className="transition-all duration-300 ease-in-out">
            {isOpen && (
              <div className="p-2 w-full text-gray-500 font-light">
                {/* File list */}
                {files.map((file) => (
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
                    <div 
                      className="p-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFileMenu({ ...showFileMenu, [file.id]: !showFileMenu[file.id] });
                      }}
                    >
                      <MoreVerticalIcon className="h-4 w-4" />
                    </div>
                    {showFileMenu[file.id] && (
                      <div className="absolute right-0 mt-8 bg-white border rounded shadow-md z-50">
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
  
                {/* Subfolders */}
                {folder.contents.map((subfolder) => (
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
              </div>
            )}
          </Accordion.Content>
        </Accordion.Item>
      </div>
      
      {/* Folder Menu */}
      {showMenu && (
        <div 
          ref={menuRef} 
          className="absolute left-20 right-0 bg-white border rounded shadow-lg"
          style={{
            top: '0',
            zIndex: 1000,
          }}
        >
          <button onClick={() => handleMenuItemClick(() => setShowRename(true))} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <PencilIcon className="h-4 w-4 mr-2" /> Rename
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
  
      {/* Rename Component */}
      <CSSTransition in={showRename} timeout={300} classNames="rename" unmountOnExit>
        <div className="absolute left-0 right-0 bg-white border rounded p-2 shadow-lg"
             style={{
               bottom: '100%',
               marginBottom: '4px',
               zIndex: 1001,
             }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border p-1 w-full mb-2"
          />
          <button onClick={handleRename} className="bg-blue-500 text-white p-1 rounded">Rename</button>
        </div>
      </CSSTransition>
  
      {/* Upload Component */}
      <CSSTransition in={showUpload} timeout={300} classNames="upload" unmountOnExit>
        <div className="absolute left-0 right-0 bg-white border rounded shadow-lg p-2"
             style={{
               bottom: '100%',
               marginBottom: '4px',
               zIndex: 1001,
             }}>
          <UploadFile
            folderRef={`workspaces/${workspaceId}/folders/${folder.id}`}
            onFileUpload={() => setShowUpload(false)}
          />
        </div>
      </CSSTransition>
  
      {/* Create Note Component */}
      <CSSTransition in={showCreateNote} timeout={300} classNames="create-note" unmountOnExit>
        <div className="absolute left-0 right-0 bg-white border rounded shadow-lg p-2"
             style={{
               bottom: '100%',
               marginBottom: '4px',
               zIndex: 1001,
             }}>
          <CreateNote 
            workspaceId={workspaceId} 
            folderId={folder.id} 
            onNoteCreated={() => setShowCreateNote(false)}
          />
        </div>
      </CSSTransition>
    </div>
  );
}
export default FolderComponent;