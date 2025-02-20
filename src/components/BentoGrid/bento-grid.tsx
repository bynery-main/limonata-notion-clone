import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, MoreHorizontal, PencilIcon, TrashIcon, User } from "lucide-react";
import { doc, collection, onSnapshot, updateDoc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import { addDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import FileThumbnail from "./get-thumbnails";
import {FileUpload} from "../ui/file-upload";
import CreateFolderModal from '../create-folder-modal/create-folder-modal';
import router from "next/router";
import { useLocations, useMembers, useSpace } from "@ably/spaces/react";
import type { ProfileData, SpaceMember } from "@ably/spaces";


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
  const { space } = useSpace();
  const { self } = useMembers();
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    if (!space || isEntered) return;

    const enterSpace = async () => {
      try {
        await space.enter();
        setIsEntered(true);
      } catch (error) {
        console.error('Error entering space:', error);
      }
    };

    enterSpace();

    return () => {
      if (space && isEntered) {
        space.leave().catch(console.error);
      }
    };
  }, [space, isEntered]);

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
        
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <button
            onClick={() => setIsCreateFolderModalVisible(true)}
            className="p-[1px] relative block "
          >

            <div className="absolute inset-0 bg-gradient-to-r from-[#C66EC5] to-[#FC608D] rounded-xl" />
            <div className="px-10 py-5 relative bg-white rounded-xl group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center h-full">
              <FolderPlus className="w-5 h-5 mr-3 text-regular" />
              <div className="flex items-center whitespace-nowrap text-xl ">
                Create Your First Folder
              </div>
            </div>
          </button>
          <div className="mt-4 w-80 font-light text-sm text-center">
        💡 A folder is a subsection of a workspace. Here's where you can store files and notes.
        </div>  
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


interface BentoLocation {
  fileId: string;
  folderId: string;
  type: "file" | "note";
}

interface LocationUpdateEvent {
  member: SpaceMember;
  position?: {
    x: number;
    y: number;
  };
  data?: BentoLocation;
}

interface DisplayInfo {
  name: string;
  avatar?: string;
}


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
  const { others } = useMembers();
  const { space } = useSpace();
  const [activeMembers, setActiveMembers] = useState<SpaceMember[]>([]);

  // Watch for location updates
  const { update: updateLocation } = useLocations((update: LocationUpdateEvent) => {
    if (update?.data?.fileId === fileId) {
      setActiveMembers(prev => {
        const existing = prev.find(m => m.connectionId === update.member.connectionId);
        if (!existing) {
          return [...prev, update.member];
        }
        return prev;
      });
    } else {
      setActiveMembers(prev => 
        prev.filter(m => m.connectionId !== update.member.connectionId)
      );
    }
  });

  const handleClick = async (event: React.MouseEvent) => {
    if (!dropdownVisible && updateLocation) {
      // Set location before navigating
      try {
        await updateLocation({
          data: {
            fileId,
            folderId,
            type
          } as BentoLocation
        });
        router.push(href);
      } catch (error) {
        console.error('Error updating location:', error);
        router.push(href);
      }
    }
  };


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


  const getMemberDisplayInfo = (member: SpaceMember): DisplayInfo => {
    const profileData = member.profileData as { username?: string; email?: string; avatar?: string } | null;
    return {
      name: profileData?.username || profileData?.email || 'Anonymous',
      avatar: typeof profileData?.avatar === 'string' ? profileData.avatar : undefined
    };
  };

  const renderMemberAvatar = (member: SpaceMember) => {
    const { name, avatar } = getMemberDisplayInfo(member);
    
    return (
      <div 
        key={member.connectionId}
        className="relative group"
      >
        {avatar ? (
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-8 h-8 rounded-full border-2 border-white bg-white object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {name}
        </div>
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
      </div>
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-neutral-200 dark:border-neutral-800 flex flex-col space-y-4 cursor-pointer relative",
        className
      )}
      onClick={handleClick}
    >
      {/* Active members display */}
      {activeMembers.length > 0 && (
        <div className="absolute -top-2 -right-2 flex -space-x-2 z-10">
          {activeMembers.map(renderMemberAvatar)}
        </div>
      )}

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