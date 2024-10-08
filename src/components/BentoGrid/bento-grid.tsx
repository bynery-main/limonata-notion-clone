import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { doc, collection, onSnapshot, updateDoc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import { addDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import FileThumbnail from "./get-thumbnails";
import {FileUpload} from "../ui/file-upload";
import CreateFolderModal from '../create-folder-modal/create-folder-modal';
import router from "next/router";

interface FileData {
  id: string;
  name: string;
  description?: string;
  url?: string; // Optional for notes, since notes won't have URLs
  type: "file" | "note"; // Distinguish between files and notes
  folderId?: string; // Add this to keep track of which folder the item belongs to
  folderName?: string;
}

interface Folder {
  id: string;
  name: string;
  contents: any; // Replace 'any' with the actual type if known
  filests: any; // Replace 'any' with the actual type if known
}

export const BentoGrid = ({
  workspaceId,
  folderId,
  className,
}: {
  workspaceId: string;
  folderId?: string;
  className?: string;
}) => {
  console.log("BentoGrid rendered with folderId:", folderId);
  const [items, setItems] = useState<FileData[]>([]);
  const [folderNames, setFolderNames] = useState<{ [key: string]: string }>({});
  const [currentFolder, setCurrentFolder] = useState<Folder | undefined>(undefined);
  const [isBentoGridEmpty, setIsBentoGridEmpty] = useState<boolean>(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isCreateFolderModalVisible, setIsCreateFolderModalVisible] = useState(false);


  useEffect(() => {
    const fetchFolders = async () => {
      const foldersRef = collection(db, "workspaces", workspaceId, "folders");
      const foldersSnapshot = await getDocs(foldersRef);
      const fetchedFolders = foldersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
      setFolders(fetchedFolders);
      setIsBentoGridEmpty(fetchedFolders.length === 0);
    };

    fetchFolders();
  }, [workspaceId]);

  const handleCreateFolder = async (folderName: string) => {
    try {
      const foldersRef = collection(db, "workspaces", workspaceId, "folders");
      const newFolderRef = await addDoc(foldersRef, {
        name: folderName,
        contents: [],
        filests: []
      });
      console.log("New folder created with ID: ", newFolderRef.id);
      setFolders(prevFolders => [...prevFolders, { id: newFolderRef.id, name: folderName, contents: [], filests: [] }]);
      setIsBentoGridEmpty(false);
      router.push(`/dashboard/${workspaceId}/${newFolderRef.id}`);
    } catch (error) {
      console.error("Error creating new folder: ", error);
    }
  };

  useEffect(() => {
    const fetchFolderDetails = async (fId: string) => {
      const folderRef = doc(db, "workspaces", workspaceId, "folders", fId);
      const folderSnap = await getDoc(folderRef);
      if (folderSnap.exists()) {
        const folderData = folderSnap.data() as Folder;
        setFolderNames(prev => ({ ...prev, [fId]: folderData.name }));
        if (fId === folderId) {
          setCurrentFolder({
            id: fId,
            name: folderData.name,
            contents: folderData.contents,
            filests: folderData.filests
          });
        } else {
          console.log("Folder not found in Firestore");
          setCurrentFolder(undefined);
        }
      } else {
        console.log("No folderId provided, setting currentFolder to undefined");
        setCurrentFolder(undefined);
        setIsBentoGridEmpty(true);
      }
    };
    
    const fetchItems = async () => {
      if (folderId) {
        // Fetch items for a specific folder
        const filesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "files");
        const notesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "notes");
        
        const [filesSnapshot, notesSnapshot] = await Promise.all([
          getDocs(filesRef),
          getDocs(notesRef)
        ]);

        const files = filesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "file",
          folderId: folderId
        })) as FileData[];

        const notes = notesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "note",
          folderId: folderId
        })) as FileData[];

        setItems([...files, ...notes]);
        fetchFolderDetails(folderId);
      } else {
        // Fetch items from all folders
        const foldersRef = collection(db, "workspaces", workspaceId, "folders");
        const foldersSnapshot = await getDocs(foldersRef);

        const itemPromises = foldersSnapshot.docs.map(async (folderDoc) => {
          const fId = folderDoc.id;
          const filesRef = collection(db, "workspaces", workspaceId, "folders", fId, "files");
          const notesRef = collection(db, "workspaces", workspaceId, "folders", fId, "notes");

          const [filesSnapshot, notesSnapshot] = await Promise.all([
            getDocs(filesRef),
            getDocs(notesRef)
          ]);

          const files = filesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: "file",
            folderId: fId
          })) as FileData[];

          const notes = notesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: "note",
            folderId: fId
          })) as FileData[];

          fetchFolderDetails(fId);

          return [...files, ...notes];
        });

        const allItems = (await Promise.all(itemPromises)).flat();
        setItems(allItems);
      }
    };

    fetchItems();
  }, [workspaceId, folderId]);

  useEffect(() => {
    console.log("Current folder updated:", currentFolder);
  }, [currentFolder]);
  
  const fetchFolderDetails = async (folderId: string) => {
    console.log("Fetching folder details for:", folderId);
    const folderRef = doc(db, "workspaces", workspaceId, "folders", folderId);
    const folderSnap = await getDoc(folderRef);
    if (folderSnap.exists()) {
      const folderData = folderSnap.data() as Folder;
      console.log("Folder data:", folderData);

      setCurrentFolder({
        id: folderId,
        name: folderData.name,
        contents: folderData.contents,
        filests: folderData.filests
      });
    }
  };

  useEffect(() => {
    if (!workspaceId) return;

    let unsubscribeFunctions: (() => void)[] = [];



    const fetchAllItems = async () => {
      const foldersRef = collection(db, "workspaces", workspaceId, "folders");
      const foldersSnapshot = await getDocs(foldersRef);

      foldersSnapshot.forEach((folderDoc) => {
        const currentFolderId = folderDoc.id;
        fetchFolderDetails(currentFolderId);

        const filesRef = collection(db, "workspaces", workspaceId, "folders", currentFolderId, "files");
        const notesRef = collection(db, "workspaces", workspaceId, "folders", currentFolderId, "notes");

        const unsubscribeFiles = onSnapshot(filesRef, (snapshot) => {
          const updatedFiles: FileData[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            type: "file",
            folderId: currentFolderId,
          })) as FileData[];

          setItems((prevItems) => [
            ...prevItems.filter((item) => !(item.type === "file" && item.folderId === currentFolderId)),
            ...updatedFiles,
          ]);
        });

        const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
          const updatedNotes: FileData[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            type: "note",
            folderId: currentFolderId,
          })) as FileData[];

          setItems((prevItems) => [
            ...prevItems.filter((item) => !(item.type === "note" && item.folderId === currentFolderId)),
            ...updatedNotes,
          ]);
        });

        unsubscribeFunctions.push(unsubscribeFiles, unsubscribeNotes);
      });
    };

    if (folderId) {
      fetchFolderDetails(folderId);
      // Existing logic for a specific folder
      const filesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "files");
      const notesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "notes");

      const unsubscribeFiles = onSnapshot(filesRef, (snapshot) => {
        const updatedFiles: FileData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "file",
          folderId,
        })) as FileData[];

        setItems((prevItems) => [...prevItems.filter((item) => item.type !== "file"), ...updatedFiles]);
      });

      const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
        const updatedNotes: FileData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "note",
          folderId,
        })) as FileData[];

        setItems((prevItems) => [...prevItems.filter((item) => item.type !== "note"), ...updatedNotes]);
      });

    if (folderId) {
      fetchFolderDetails(folderId);
    } else {
      setCurrentFolder(undefined);
    }
    console.log("Current folder after effect:", currentFolder);

      unsubscribeFunctions.push(unsubscribeFiles, unsubscribeNotes);
    } else {
      // Fetch all items from all folders
      fetchAllItems();
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [workspaceId, folderId]);

  
  const getItemClass = (index: number, totalItems: number) => {
    // This pattern repeats every 9 items (8 items + FileUpload)
    const adjustedIndex = index % 9;
    const isLastItem = index === totalItems - 1;
    
    if (isLastItem && items.length > 0) {
      return "col-span-1"; // FileUpload takes one column when there are other items
    }
    
    switch (adjustedIndex) {
      case 0: // 1st item
      case 3: // 4th item
      case 7: // 8th item
        return "col-span-2";
      default:
        return "col-span-1";
    }
  };





  return (
    <div className={cn("max-w-7xl mx-auto p-4", className)}>
      {folders.length === 0 ? (
        <div className="flex items-center justify-center mt-30">
          <button
            onClick={() => setIsCreateFolderModalVisible(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold hover:from-pink-600 hover:to-yellow-600 transition-colors"
          >
            Create Your First Folder
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center mt-30">
          <FileUpload 
            workspaceId={workspaceId} 
            db={db} 
            onFileUpload={() => {}} 
            folder={currentFolder}
            isBentoGridEmpty={true}
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, index) => (
            <BentoGridItem
              key={item.id}
              workspaceId={workspaceId}
              folderId={item.folderId || ''}
              fileId={item.id}
              title={item.name}
              header={<FileThumbnail fileName={item.name} fileUrl={item.url} />}
              description={`${folderNames[item.folderId || ''] || 'Unknown'}`}
              href={`/dashboard/${workspaceId}/${item.folderId}/${item.id}`}
              type={item.type}
              className={getItemClass(index, items.length + 1)}
            />
          ))}
          <div className={cn("p-4 flex items-center justify-center z-0", getItemClass(items.length, items.length + 1))}>
            <FileUpload 
              workspaceId={workspaceId} 
              db={db} 
              onFileUpload={() => {}} 
              folder={currentFolder}
              isBentoGridEmpty={false}
            />
          </div>
        </div>
      )}
      <CreateFolderModal
        isVisible={isCreateFolderModalVisible}
        onClose={() => setIsCreateFolderModalVisible(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export const BentoGridItem = ({
  workspaceId,
  folderId,
  fileId,
  className,
  title,
  description,
  header,
  icon,
  href,
  type,
}: {
  workspaceId: string;
  folderId: string;
  fileId: string;
  className?: string;
  title: string;
  description: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  href: string;
  type: "file" | "note";
}) => {
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newName, setNewName] = useState(title);

  const handleRename = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (newName.trim() === "") return;

    try {
      const fileRef = doc(db, `workspaces/${workspaceId}/folders/${folderId}/files/${fileId}`);
      const noteRef = doc(db, `workspaces/${workspaceId}/folders/${folderId}/notes/${fileId}`);
      const fileSnapshot = await getDoc(fileRef);
      const noteSnapshot = await getDoc(noteRef);

      if (fileSnapshot.exists()) {
        // Handle renaming a file in storage
        const oldFileName = fileSnapshot.data()?.name;
        const oldFileExtension = oldFileName.split('.').pop()?.toLowerCase();

        // Check if the new name ends with the correct extension
        let newFileName = newName;
        if (!newFileName.toLowerCase().endsWith(`.${oldFileExtension}`)) {
          newFileName = `${newFileName}.${oldFileExtension}`;
        }

        const oldStoragePath = `workspaces/${workspaceId}/folders/${folderId}/${oldFileName}`;
        const newStoragePath = `workspaces/${workspaceId}/folders/${folderId}/${newFileName}`;
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

      } else if (noteSnapshot.exists()) {
        // Handle renaming a note (only in Firestore)
        await updateDoc(noteRef, { name: newName });
      } else {
        console.error("File or note not found in Firestore.");
      }

      setDropdownVisible(false);
    } catch (error) {
      console.error("Error renaming file or note:", error);
    }
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const fileRef = doc(db, "workspaces", workspaceId, "folders", folderId, "files", fileId);
      const noteRef = doc(db, "workspaces", workspaceId, "folders", folderId, "notes", fileId);

      const fileSnapshot = await getDoc(fileRef);
      if (fileSnapshot.exists()) {
        const fileName = fileSnapshot.data()?.name;
        const storagePath = `workspaces/${workspaceId}/folders/${folderId}/${fileName}`;
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
      setDropdownVisible(false);
    } catch (error) {
      console.error("Error deleting from Firestore or Storage:", error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  const handleClick = (event: React.MouseEvent) => {
    if (!dropdownVisible) {
      router.push(href); // Redirect only if the dropdown isn't visible
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-neutral-200 dark:border-neutral-800 flex flex-col space-y-4 cursor-pointer relative",
        className
      )}
      onClick={handleClick}
    >
      <div className="aspect-w-16 aspect-h-9 relative rounded-lg overflow-hidden">
        {header}
      </div>
      <div className="flex flex-col flex-grow min-h-0 group-hover/bento:translate-x-2 transition duration-200">
        <h3 className="font-semibold text-lg mb-1 truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 overflow-hidden text-ellipsis">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto group-hover/bento:translate-x-2 transition duration-200">
        {icon && (
          <div className="opacity-70 group-hover/bento:opacity-100 transition duration-200">
            {icon}
          </div>
        )}
        <div className="relative">
          <MoreHorizontal
            className="h-5 w-5 text-neutral-500 cursor-pointer bento-menu"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownVisible(!dropdownVisible);
            }}
          />
          {dropdownVisible && (
            <div 
              ref={dropdownRef} 
              className="absolute left-0 bottom-full mb-2 w-48 bg-white border rounded-lg shadow-lg z-50"
              style={{ minWidth: '200px' }}
            >
              <div className="p-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Rename"
                  className="border p-1 rounded w-full"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={handleRename}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <PencilIcon className="h-3.5 w-3.5 mr-2 inline" /> Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-2 inline" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};