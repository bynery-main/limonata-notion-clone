import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { doc, collection, onSnapshot, updateDoc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface FileData {
  id: string;
  name: string;
  description?: string;
  url?: string; // Optional for notes, since notes won't have URLs
  type: "file" | "note"; // Distinguish between files and notes
  folderId?: string; // Add this to keep track of which folder the item belongs to
  folderName?: string;
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
  const [items, setItems] = useState<FileData[]>([]);
  const [folderNames, setFolderNames] = useState<{ [key: string]: string }>({});


  const getFilePreview = (file: FileData) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const pdfExtensions = ["pdf"];
    const docExtensions = ["doc", "docx"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac"];
    const videoExtensions = ["mp4", "avi", "mov", "wmv"];

    if (imageExtensions.includes(fileExtension || "")) {
      return (
        <div className="w-full h-48 relative">
          <Image src={file.url!} alt={file.name} fill style={{ objectFit: "cover" }} />
        </div>
      );
    }

    let emoji = "📝";
    if (pdfExtensions.includes(fileExtension || "")) emoji = "📕";
    else if (docExtensions.includes(fileExtension || "")) emoji = "📘";
    else if (audioExtensions.includes(fileExtension || "")) emoji = "🎵";
    else if (videoExtensions.includes(fileExtension || "")) emoji = "🎥";

    return (
      <div className="w-full h-48 flex items-center justify-center">
        <span className="text-4xl">{emoji}</span>
      </div>
    );
  };

  useEffect(() => {
    if (!workspaceId) return;

    let unsubscribeFunctions: (() => void)[] = [];

    const fetchFolderName = async (folderId: string) => {
      const folderRef = doc(db, "workspaces", workspaceId, "folders", folderId);
      const folderSnap = await getDoc(folderRef);
      if (folderSnap.exists()) {
        const folderData = folderSnap.data();
        setFolderNames(prev => ({ ...prev, [folderId]: folderData.name }));
      }
    };

    const fetchAllItems = async () => {
      const foldersRef = collection(db, "workspaces", workspaceId, "folders");
      const foldersSnapshot = await getDocs(foldersRef);

      foldersSnapshot.forEach((folderDoc) => {
        const currentFolderId = folderDoc.id;
        fetchFolderName(currentFolderId);

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
      fetchFolderName(folderId);
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

      unsubscribeFunctions.push(unsubscribeFiles, unsubscribeNotes);
    } else {
      // Fetch all items from all folders
      fetchAllItems();
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [workspaceId, folderId]);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto p-4", className)}>
      {items.map((item) => (
        <BentoGridItem
          key={item.id}
          workspaceId={workspaceId}
          folderId={item.folderId || ''} // Use the item's folderId
          fileId={item.id}
          title={item.name}
          header={getFilePreview(item)}
          description={`In Folder: ${folderNames[item.folderId || ''] || 'Unknown'}`}
          href={`/dashboard/${workspaceId}/${item.folderId}/${item.id}`} // Use item.folderId in the href
          type={item.type}
        />
      ))}
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
  type, // New prop to distinguish between file and note
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
  type: "file" | "note"; // New prop
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
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border-2 border-neutral-200 dark:border-neutral-800 flex flex-col space-y-4 cursor-pointer",
        className
      )}
      onClick={handleClick} // Trigger redirect if not interacting with buttons
    >
      <div className="aspect-w-16 aspect-h-9 relative rounded-lg overflow-hidden">
        {header}
      </div>
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="flex items-center justify-between">
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">{title}</div>
          <div className="flex items-center space-x-2 relative">
            {icon && (
              <div className="opacity-70 group-hover/bento:opacity-100 transition duration-200">{icon}</div>
            )}
            <MoreHorizontal
              className="h-5 w-5 text-neutral-500 cursor-pointer bento-menu"
              onClick={(e) => {
                e.stopPropagation(); // Prevent redirect
                setDropdownVisible(!dropdownVisible);
              }}
            />
            {dropdownVisible && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Rename"
                    className="border p-1 rounded w-full"
                    onClick={(e) => e.stopPropagation()} // Prevent click from triggering redirect
                  />
                  <button
                    onClick={handleRename}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <PencilIcon className="h-3.5 w-3.5 mr-2" /> Rename
                  </button>
                  <button
                    onClick={handleDelete}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <TrashIcon className="h-3.5 w-3.5 mr-2" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="font-sans font-normal text-neutral-600 text-sm dark:text-neutral-300">{description}</div>
      </div>
    </div>
  );
};
