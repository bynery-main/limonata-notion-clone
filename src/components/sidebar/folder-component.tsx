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
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const FolderComponent: React.FC<FolderComponentProps> = ({
  folder,
  parentFolderId,
  workspaceId,
  setFolders,
  deleteFolder,
  deleteFile,
  onSelect,
  openFolderId,
  setOpenFolderId,
  isActive,
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
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const fileRenameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen !== (openFolderId === folder.id)) {
      setIsOpen(openFolderId === folder.id);
    }
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

  const handleFileClick = (file: FileData) => {
    router.push(`/dashboard/${workspaceId}/${folder.id}/${file.id}`);
  };

  const handleMenuItemClick = (action: () => void) => {
    setShowMenu(false);
    setOpenFolderId(folder.id);
    action();
  };

  const startRenameFolder = () => {
    setNewName(folder.name);
    setIsRenamingFolder(true);
    setShowMenu(false);
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 50);
  };

  const handleRename = async () => {
    if (newName.trim() === "") return;
    if (newName === folder.name) {
      setIsRenamingFolder(false);
      return;
    }
    
    try {
      const folderRef = doc(db, "workspaces", workspaceId, "folders", folder.id);
      await updateDoc(folderRef, { name: newName });
      setIsRenamingFolder(false);
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const startRenameFile = (file: FileData) => {
    setRenameFileId(file.id);
    setRenameFileName(file.name || "");
    setShowFileMenu({ ...showFileMenu, [file.id]: false });
    setTimeout(() => {
      fileRenameInputRef.current?.focus();
      fileRenameInputRef.current?.select();
    }, 50);
  };

  const handleRenameFile = async (fileId: string) => {
    if (renameFileName.trim() === "") return;
    
    const file = files.find(f => f.id === fileId);
    if (file && renameFileName === file.name) {
      setRenameFileId(null);
      return;
    }

    try {
      // First determine if it's a file or note
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
        if (oldFileExtension && !newFileName.toLowerCase().endsWith(`.${oldFileExtension}`)) {
          newFileName = `${newFileName}.${oldFileExtension}`;
        }

        // Update Firestore with the new name
        await updateDoc(fileRef, { name: newFileName });
        
        // Update the state to reflect the new file name
        setFiles(prevFiles =>
          prevFiles.map(file =>
            file.id === fileId ? { ...file, name: newFileName } : file
          )
        );
      } else if (noteSnapshot.exists()) {
        // Handle renaming a note (only in Firestore)
        await updateDoc(noteRef, { name: renameFileName });
        
        // Update the state to reflect the new note name
        setFiles(prevFiles =>
          prevFiles.map(file =>
            file.id === fileId ? { ...file, name: renameFileName } : file
          )
        );
      }
    } catch (error) {
      console.error("Error renaming file or note:", error);
    }

    setRenameFileId(null);
    setShowFileMenu({ ...showFileMenu, [fileId]: false });
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileRef = doc(db, `workspaces/${workspaceId}/folders/${folder.id}/files/${fileId}`);
      const noteRef = doc(db, `workspaces/${workspaceId}/folders/${folder.id}/notes/${fileId}`);

      // Get workspace reference - we'll need this for both file and note cases
      const workspaceRef = doc(db, "workspaces", workspaceId);
      let workspaceDoc = await getDoc(workspaceRef);
      let workspaceCharCount = workspaceDoc.data()?.charCount || 0;

      // Attempt to delete as a file first
      try {
        const fileSnapshot = await getDoc(fileRef);
        if (fileSnapshot.exists()) {
          const fileData = fileSnapshot.data();
          const fileName = fileSnapshot.data()?.name;

          if (fileData?.transcript) {
            const transcriptCharCount = fileData.transcript.length;
            workspaceCharCount -= transcriptCharCount;
            console.log(`Subtracting ${transcriptCharCount} characters from transcript`);
          }

          const storagePath = `workspaces/${workspaceId}/folders/${folder.id}/${fileName}`;
          const storageRef = ref(storage, storagePath);
          await deleteObject(storageRef);  // Delete from storage
          await deleteDoc(fileRef);  // Delete from Firestore

          if (fileData?.transcript) {
            workspaceCharCount = Math.max(0, workspaceCharCount);
            await updateDoc(workspaceRef, { charCount: workspaceCharCount });
            console.log(`Updated workspace character count after file deletion: ${workspaceCharCount}`);
          }

        } else {
          // If not found as a file, attempt to delete as a note
          const noteSnapshot = await getDoc(noteRef);
          if (noteSnapshot.exists()) {
            // Get workspace document reference
            const workspaceRef = doc(db, "workspaces", workspaceId);
            let workspaceDoc = await getDoc(workspaceRef);
            let workspaceCharCount = workspaceDoc.data()?.charCount || 0;

            const noteData = noteSnapshot.data();
            const noteText = noteData.text || "";
            
            // Count characters in the note's text
            const noteCharCount = noteText.length;
            
            // Subtract note's character count from workspace total
            workspaceCharCount -= noteCharCount;
            
            await deleteDoc(noteRef);  // Delete from Firestore
            
            workspaceCharCount = Math.max(0, workspaceCharCount);
            await updateDoc(workspaceRef, { charCount: workspaceCharCount })
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

  const getFileEmoji = (fileName: string | undefined) => {
    if (!fileName) return "📝"; // Default emoji for undefined or empty file names

    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const pdfExtensions = ["pdf"];
    const docExtensions = ["doc", "docx"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac"];
    const videoExtensions = ["mp4", "avi", "mov", "wmv"];
    const presentationExtensions = ["ppt", "pptx"];

    if (imageExtensions.includes(fileExtension || "")) return "🖼️";
    if (pdfExtensions.includes(fileExtension || "")) return "📕";
    if (docExtensions.includes(fileExtension || "")) return "📘";
    if (audioExtensions.includes(fileExtension || "")) return "🎵";
    if (videoExtensions.includes(fileExtension || "")) return "🎥";
    if (presentationExtensions.includes(fileExtension || "")) return "📊";
    return "📝";
  };
  const toggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setOpenFolderId(null);
    } else {
      setOpenFolderId(folder.id);
    }
  };

  const handleUploadClick = async () => {
    try {
      // Fetch charCount from workspace
      const workspaceRef = doc(db, "workspaces", workspaceId);
      const workspaceDoc = await getDoc(workspaceRef);
      const workspaceCharCount = workspaceDoc.data()?.charCount || 0;
  
      if (workspaceCharCount >= 200000) {
        toast.error("You have exceeded the character limit. Upload not allowed.");
        return;
      }
  
      // If within limit, proceed to show upload modal
      setShowUpload(true);
    } catch (error) {
      console.error("Error checking workspace character count:", error);
      toast.error("Error checking character limit. Try again later.");
    }
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      // setOpenFolderId(null);
      router.push(`/dashboard/${workspaceId}/${folder.id}`);
    } else {
      setOpenFolderId(folder.id);
      router.push(`/dashboard/${workspaceId}/${folder.id}`);
      onSelect();
    }
  };

  return (
    <div className="relative w-64" ref={menuRef}>
      <div className={`overflow-visible break-words border border-gray-300 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100 border-[#F6B144]' : 'bg-white border-gray-300'}`}>
        <div className="hover:no-underline p-2 dark:text-muted-foreground text-sm w-full text-left">
          <div 
            className="flex items-center justify-between overflow-visible"
            onClick={handleFolderClick}
          >
            <div className="flex items-center gap-2 flex-grow min-w-0">
              <div 
                className="flex items-starts max-w-10 h-full hover:bg-gray-200 rounded-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(e);
                }}
              >
                <ChevronRightIcon
                  className="h-4 w-4 cursor-pointer flex-shrink-0"
                  style={{ 
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", 
                    transition: "transform 0.3s ease" 
                  }}
                />
              </div>
              {isRenamingFolder ? (
                <div className="flex items-center flex-grow min-w-0">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setIsRenamingFolder(false);
                    }}
                    className="text-sm bg-transparent w-full border border-gray-300 rounded p-1 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <span 
                  className="truncate w-full flex-grow overflow-visible break-words"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRenameFolder();
                  }}
                >
                  {folder.name}
                </span>
              )}
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
          
          <AnimatePresence initial={false} mode="wait">
            {isOpen && (
              <motion.div 
                className="py-2 w-full text-gray-500 font-light"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.1,
                  exit: { duration: 0.1 }
                }}
              >
                {/* File list */}
                {files.map((file, index) => (
                  <motion.div 
                    key={file.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: index * 0.05,
                      exit: { duration: 0.2, delay: 0 }
                    }}
                    className={`flex items-center p-2 rounded cursor-pointer rounded-lg ${
                      hoveredFileId === file.id ? 'bg-gray-200' : ''
                    }`}
                    onMouseEnter={() => setHoveredFileId(file.id)}
                    onMouseLeave={() => setHoveredFileId(null)}
                  >
                    <span className="mr-2" onClick={() => handleFileClick(file)}>{getFileEmoji(file.name)}</span>
                    {renameFileId === file.id ? (
                      <div className="flex items-center flex-grow">
                        <input
                          ref={fileRenameInputRef}
                          type="text"
                          value={renameFileName}
                          onChange={(e) => setRenameFileName(e.target.value)}
                          onBlur={() => handleRenameFile(file.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameFile(file.id);
                            if (e.key === "Escape") setRenameFileId(null);
                          }}
                          className="text-sm bg-transparent w-full border border-gray-300 rounded p-1 focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <span 
                        className="text-sm flex-grow" 
                        onClick={() => handleFileClick(file)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startRenameFile(file);
                        }}
                      >
                        {file.name || "Unnamed File"}
                      </span>
                    )}
                    <div 
                      className="py-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFileMenu({ ...showFileMenu, [file.id]: !showFileMenu[file.id] });
                      }}
                    >
                      <MoreVerticalIcon className="h-4 w-4" />
                    </div>
                    {showFileMenu[file.id] && (
                      <div className="absolute right-0 mt-8 bg-white border rounded-lg shadow-md z-50 mr-2">
                        <button onClick={() => startRenameFile(file)} className="p-2 hover:bg-gray-100 w-full text-left flex items-center">
                          <PencilIcon className="h-4 w-4 mr-2" /> Rename
                        </button>
                        <button onClick={() => handleDeleteFile(file.id)} className="p-2 hover:text-red-600 hover:bg-gray-100 w-full text-left flex items-center">
                          <TrashIcon className="h-4 w-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
    
                {/* Subfolders */}
                {folder.contents.map((subfolder, index) => (
                  <motion.div
                    key={subfolder.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: index * 0.05,
                      exit: { duration: 0.2, delay: 0 }
                    }}
                  >
                    <FolderComponent
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
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
          <button onClick={() => startRenameFolder()} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <PencilIcon className="h-4 w-4 mr-2" /> Rename
          </button>
          <button onClick={() => handleMenuItemClick(() => setShowCreateNote(true))} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <NotebookIcon className="h-4 w-4 mr-2" /> Create Note
          </button>
          <button onClick={handleUploadClick} className="p-2 hover:bg-gray-200 w-full text-left flex items-center">
            <UploadIcon className="h-4 w-4 mr-2" /> Upload File
          </button>
          <button onClick={() => { deleteFolder(workspaceId, folder.id, parentFolderId); setShowMenu(false); }} className="p-2 text-red-600 hover:bg-gray-200 w-full text-left flex items-center">
            <TrashIcon className="h-4 w-4 mr-2" /> Delete Topic
          </button>
        </div>
      )}
  
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