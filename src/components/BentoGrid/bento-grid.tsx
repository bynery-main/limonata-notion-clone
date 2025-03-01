import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, MoreHorizontal, PencilIcon, TrashIcon, User, Folder, Layout, HelpCircle, BookOpen } from "lucide-react";
import { doc, collection, onSnapshot, updateDoc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import { addDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import FileThumbnail from "./get-thumbnails";
import {FileUpload} from "../ui/file-upload";
import CreateFolderModal from '../create-folder-modal/create-folder-modal';
import { useLocations, useMembers, useSpace } from "@ably/spaces/react";
import type { ProfileData, SpaceMember } from "@ably/spaces";
import { ResourceCreator } from "../ui/resource-creator";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


interface FileData {
  id: string;
  name: string;
  description?: string;
  url?: string;
  type: "file" | "note" | "decks" | "quizzes" | "studyguides";
  folderId?: string;
  folderName?: string;
}

interface Folder {
  id: string;
  name: string;
  contents: any; // Replace 'any' with the actual type if known
  filests: any; // Replace 'any' with the actual type if known
}

interface BentoGridProps {
  workspaceId: string;
  folderId?: string;
  className?: string;
  type: string;
  userId: string;
  filterFolderId?: string | null;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  workspaceId,
  folderId,
  className,
  type,
  userId,
  filterFolderId,
}: {
  workspaceId: string;
  folderId?: string;
  className?: string;
  type: string;
  userId: string;
  filterFolderId?: string | null;
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
  const router = useRouter();

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

  useEffect(() => {
    const fetchFolderNames = async () => {
      const folderNamesMap: { [key: string]: string } = {};
      
      // Fetch all folders to get their names
      const foldersRef = collection(db, "workspaces", workspaceId, "folders");
      const foldersSnapshot = await getDocs(foldersRef);
      
      foldersSnapshot.docs.forEach(doc => {
        folderNamesMap[doc.id] = doc.data().name || 'Unnamed Folder';
      });
      
      setFolderNames(folderNamesMap);
    };
    
    fetchFolderNames();
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

  const fetchItems = async () => {
    if (folderId) {
      // Fetch items for a specific folder
      let itemsRef;
      switch (type) {
        case 'decks':
          itemsRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");
          break;
        case 'quizzes':
          itemsRef = collection(db, "workspaces", workspaceId, "quizSets");
          break;
        case 'studyguides':
          itemsRef = collection(db, "workspaces", workspaceId, "studyGuides");
          break;
        default: // 'files'
          const filesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "files");
          const notesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "notes");
          
          const [filesSnapshot, notesSnapshot] = await Promise.all([
            getDocs(filesRef),
            getDocs(notesRef)
          ]);

          const files = filesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || 'Untitled',
            ...doc.data(),
            type: "file" as const,
            folderId: folderId
          })) as FileData[];

          const notes = notesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || 'Untitled',
            ...doc.data(),
            type: "note" as const,
            folderId: folderId
          })) as FileData[];

          setItems([...files, ...notes]);
          return;
      }

      const snapshot = await getDocs(itemsRef);
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Untitled',
        ...doc.data(),
        type: type as FileData['type'],
        folderId: folderId
      })) as FileData[];

      setItems(fetchedItems);
    } else {
      // Fetch items from workspace level collections
      let itemsRef;
      switch (type) {
        case 'decks':
          itemsRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");
          break;
        case 'quizzes':
          itemsRef = collection(db, "workspaces", workspaceId, "quizSets");
          break;
        case 'studyguides':
          itemsRef = collection(db, "workspaces", workspaceId, "studyGuides");
          break;
        default:
          // Handle files and notes from all folders
          const foldersRef = collection(db, "workspaces", workspaceId, "folders");
          const foldersSnapshot = await getDocs(foldersRef);
          
          const allItems = await Promise.all(
            foldersSnapshot.docs.map(async (folderDoc) => {
              const fId = folderDoc.id;
              const filesRef = collection(db, "workspaces", workspaceId, "folders", fId, "files");
              const notesRef = collection(db, "workspaces", workspaceId, "folders", fId, "notes");
              
              const [filesSnapshot, notesSnapshot] = await Promise.all([
                getDocs(filesRef),
                getDocs(notesRef)
              ]);

              const files = filesSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || 'Untitled',
                ...doc.data(),
                type: "file" as const,
                folderId: fId
              })) as FileData[];

              const notes = notesSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || 'Untitled',
                ...doc.data(),
                type: "note" as const,
                folderId: fId
              })) as FileData[];

              return [...files, ...notes];
            })
          );

          setItems(allItems.flat());
          return;
      }

      const snapshot = await getDocs(itemsRef);
      const updatedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || 'Untitled',
        ...doc.data(),
        type: type as FileData['type'],
      })) as FileData[];

      setItems(updatedItems);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [workspaceId, folderId, type]);

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

    // Set up real-time listeners based on type
    let itemsRef;
    switch (type) {
      case 'decks':
        itemsRef = collection(db, "workspaces", workspaceId, "flashcardsDecks");
        break;
      case 'quizzes':
        itemsRef = collection(db, "workspaces", workspaceId, "quizSets");
        break;
      case 'studyguides':
        itemsRef = collection(db, "workspaces", workspaceId, "studyGuides");
        break;
      default:
        // Handle files and notes
        if (folderId) {
          const filesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "files");
          const notesRef = collection(db, "workspaces", workspaceId, "folders", folderId, "notes");

          const unsubscribeFiles = onSnapshot(filesRef, (snapshot) => {
            const updatedFiles = snapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name || 'Untitled',
              ...doc.data(),
              type: "file" as const,
              folderId,
            })) as FileData[];

            setItems(prev => [...prev.filter(item => item.type !== "file"), ...updatedFiles]);
          });

          const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
            const updatedNotes = snapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name || 'Untitled',
              ...doc.data(),
              type: "note" as const,
              folderId,
            })) as FileData[];

            setItems(prev => [...prev.filter(item => item.type !== "note"), ...updatedNotes]);
          });

          unsubscribeFunctions.push(unsubscribeFiles, unsubscribeNotes);
          return;
        }
    }

    if (itemsRef) {
      const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
        const updatedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Untitled',
          ...doc.data(),
          type: type as FileData['type'],
        })) as FileData[];

        setItems(updatedItems);
      });

      unsubscribeFunctions.push(unsubscribe);
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [workspaceId, folderId, type]);

  
  const getItemClass = (index: number, totalItems: number) => {
    // This pattern repeats every 9 items (8 items + FileUpload)
    const adjustedIndex = index % 9;
    const isLastItem = index === totalItems - 1;
    
    if (isLastItem && items.length > 0) {
      return "col-span-1"; // FileUpload takes one column when there are other items
    }
    if (window.innerWidth <= 740) {
      return "col-span-1" // Apply getItemClass if screen width is at least 640px (sm breakpoint)
    }
    switch (adjustedIndex) {
      case 0: // 1st item
      case 5: // 4th item
      case 8: // 8th item
        return "col-span-1";
      default:
        return "col-span-1";
    }
  };

  // Add this to filter items based on the selected folder
  const filteredItems = React.useMemo(() => {
    if (!filterFolderId || type !== "files") {
      return items;
    }
    return items.filter(item => item.folderId === filterFolderId);
  }, [items, filterFolderId, type]);

  return (
    <div className={cn("w-full", className)} style={{ position: 'relative', zIndex: 1 }}>
      {folders.length === 0 ? (
        <div className="flex flex-col -mt-20 items-center justify-center h-[calc(100vh-200px)]">
          <button
            onClick={() => setIsCreateFolderModalVisible(true)}
            className="p-[1px] relative block "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#C66EC5] to-[#FC608D] rounded-xl" />
            <div className="px-10 py-5  relative bg-white rounded-xl group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center h-full">
              <FolderPlus className="w-5 h-5 mr-3 text-regular" />
              <div className="flex items-center whitespace-nowrap text-xl">
                Create Your First Topic
              </div>
            </div>
          </button>
          <div className="mt-4 w-80 font-light text-sm text-center">
            💡 A topic is a subsection of a workspace. Here&apos;s where you can store files and notes.
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-30">
          {type === "files" ? (
            <div className="w-full max-w-md z-10">
              <FileUpload
                workspaceId={workspaceId}
                db={db}
                onFileUpload={() => {}}
                folder={currentFolder}
                isBentoGridEmpty={true}
              />
              <div className="text-center mt-6">
                <button 
                  onClick={() => {
                    // This will trigger the same action as the "New Live Note" button
                    const event = new CustomEvent('create-new-note');
                    document.dispatchEvent(event);
                  }}
                  className="text-sm text-gray-400 font-medium flex items-center justify-center mx-auto bg-white px-4 py-2 rounded-lg group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <svg 
                    className="w-4 h-4 mr-2 transition-colors group-hover:stroke-[#C66EC5]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#C66EC5] group-hover:to-[#FC608D]">
                    Or create a new<span className="font-bold ml-1">Collaborative Live Note</span>
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <ResourceCreator
              workspaceId={workspaceId}
              userId={self?.connectionId || ''}
              type={type as "decks" | "quizzes" | "studyguides"}
              isBentoGridEmpty={true}
            />
          )}
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`creator-${type}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ 
                duration: 0.15,
                ease: "easeOut"
              }}
              layout
            >
              {type === "files" ? (
                <FileUpload
                  workspaceId={workspaceId}
                  db={db}
                  onFileUpload={() => {}}
                  folder={currentFolder}
                  isBentoGridEmpty={false}
                />
              ) : (
                <ResourceCreator
                  workspaceId={workspaceId}
                  userId={self?.connectionId || ''}
                  type={type as "decks" | "quizzes" | "studyguides"}
                  isBentoGridEmpty={false}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="sync">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ 
                  duration: 0.15, 
                  delay: index * 0.02,
                  ease: "easeOut"
                }}
                layout
              >
                <BentoGridItem
                  workspaceId={workspaceId}
                  folderId={item.folderId || ''}
                  fileId={item.id}
                  title={item.name}
                  header={<FileThumbnail fileName={item.name} fileUrl={item.url} type={item.type} />}
                  description={`${folderNames[item.folderId || ''] || 'Unknown'}`}
                  href={`/dashboard/${workspaceId}/${item.folderId}/${item.id}`}
                  type={item.type}
                  className={getItemClass(index, filteredItems.length + 1)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
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
  type: "file" | "note" | "decks" | "quizzes" | "studyguides";
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

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if dropdown is visible
    if (dropdownVisible) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Construct the correct URL based on item type
    let navigateUrl;
    if (type === "file" || type === "note") {
      navigateUrl = `/dashboard/${workspaceId}/${folderId}/${fileId}`;
    } else if (type === "decks") {
      navigateUrl = `/dashboard/${workspaceId}/decks/${fileId}`;
    } else if (type === "quizzes") {
      navigateUrl = `/dashboard/${workspaceId}/quizzes/${fileId}`;
    } else if (type === "studyguides") {
      navigateUrl = `/dashboard/${workspaceId}/studyguides/${fileId}`;
    } else {
      navigateUrl = href; // Fallback to the provided href
    }
    
    console.log("Navigating to:", navigateUrl);
    
    // Update location in the background if available
    if (updateLocation) {
      updateLocation({
        data: {
          fileId,
          folderId,
          type
        } as BentoLocation
      }).catch(error => {
        console.error('Error updating location:', error);
      });
    }
    
    // Use router.push for client-side navigation instead of creating an anchor element
    router.push(navigateUrl);
  };


  const handleRename = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (newName.trim() === "") return;

    try {
      // Handle different item types
      let itemRef;
      
      if (type === "file" || type === "note") {
        // Existing logic for files and notes
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
      } else {
        // Handle other item types (decks, quizzes, studyguides)
        let collectionName;
        switch (type) {
          case 'decks':
            collectionName = "flashcardsDecks";
            break;
          case 'quizzes':
            collectionName = "quizSets";
            break;
          case 'studyguides':
            collectionName = "studyGuides";
            break;
        }
        
        if (collectionName) {
          const itemRef = doc(db, `workspaces/${workspaceId}/${collectionName}/${fileId}`);
          await updateDoc(itemRef, { name: newName });
        }
      }

      setDropdownVisible(false);
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      if (type === "file" || type === "note") {
        // Existing logic for files and notes
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
      } else {
        // Handle other item types (decks, quizzes, studyguides)
        let collectionName;
        switch (type) {
          case 'decks':
            collectionName = "flashcardsDecks";
            break;
          case 'quizzes':
            collectionName = "quizSets";
            break;
          case 'studyguides':
            collectionName = "studyGuides";
            break;
        }
        
        if (collectionName) {
          const itemRef = doc(db, `workspaces/${workspaceId}/${collectionName}/${fileId}`);
          await deleteDoc(itemRef);
        }
      }
      
      setDropdownVisible(false);
    } catch (error) {
      console.error("Error deleting item:", error);
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

  const handleFolderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the parent click handler
    router.push(`/dashboard/${workspaceId}/${folderId}`);
  };

  return (
    <div
      className={cn(
        "rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input p-4 bg-white border border-neutral-200 flex flex-col space-y-4 cursor-pointer relative",
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
        <p 
          className={cn(
            "text-sm text-gray-500 overflow-hidden text-ellipsis flex items-center gap-1",
            type === "file" || type === "note" ? "hover:text-[#F6B144] cursor-pointer" : ""
          )}
          onClick={type === "file" || type === "note" ? handleFolderClick : undefined}
        >
          {type === "file" || type === "note" ? (
            <Folder className="h-4 w-4" />
          ) : type === "decks" ? (
            <Layout className="h-4 w-4" />
          ) : type === "quizzes" ? (
            <HelpCircle className="h-4 w-4" />
          ) : type === "studyguides" ? (
            <BookOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
          {type === "file" || type === "note" ? (
            description
          ) : type === "decks" ? (
            "Flashcard"
          ) : type === "quizzes" ? (
            "Quiz"
          ) : type === "studyguides" ? (
            "Study Guide"
          ) : (
            description
          )}
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
              e.preventDefault();
              setDropdownVisible(!dropdownVisible);
            }}
          />
          {dropdownVisible && (
            <div 
              ref={dropdownRef} 
              className="absolute left-0 bottom-full mb-2 w-48 bg-white border rounded-lg shadow-lg z-50"
              style={{ minWidth: '200px' }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <div className="p-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Rename"
                  className="border p-1 rounded w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleRename(e);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <PencilIcon className="h-3.5 w-3.5 mr-2 inline" /> Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDelete(e);
                  }}
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