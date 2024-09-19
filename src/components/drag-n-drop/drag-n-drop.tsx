import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { storage } from "@/firebase/firebaseConfig";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  UploadIcon,
  CheckCircle,
  AlertCircle,
  FileIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import FancyText from "@carefully-coded/react-text-gradient";

interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
  fileType: string;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
}

interface FileUploaderProps {
  workspaceId: string;
  db: any;
  onFileUpload: (file: FileData) => void;
  isVisible: boolean;
  onClose: () => void;
  initialFile?: File;
  folder?: Folder;
}

const allowedFileTypes: { [key: string]: string } = {
  mp3: "audio",
  wav: "audio",
  pdf: "document",
  docx: "document",
  ppt: "powerpoint",
  pptx: "powerpoint",
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
};

const FileUploader: React.FC<FileUploaderProps> = ({
  workspaceId,
  db,
  onFileUpload,
  isVisible,
  onClose,
  initialFile,
  folder,
}) => {
  console.log("Received folder prop:", folder); // Add this line
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  useEffect(() => {
    console.log("Setting selected folder:", folder);
    const fetchFolders = async () => {
      if (!folder) {
        const foldersCollectionRef = collection(
          db,
          "workspaces",
          workspaceId,
          "folders"
        );
        const folderSnapshot = await getDocs(foldersCollectionRef);
        const folderList = folderSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          contents: doc.data().contents,
          filests: doc.data().filests,
        }));
        setFolders(folderList);
      }
    };

    if (isVisible) {
      fetchFolders();
    }
  }, [db, workspaceId, isVisible, folder]);
  useEffect(() => {
    if (folder) {
      setSelectedFolder(folder);
    }
  }, [folder]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setErrorMessage(null);
      setIsUploadComplete(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (!file || !selectedFolder) {
      setErrorMessage("Please select a file and a folder.");
      return;
    }

    const fileType = determineFileType(file.name);

    if (fileType === "other") {
      setErrorMessage("This file type is not allowed for upload.");
      return;
    }

    setIsUploading(true);
    const uploadFolder = folder || selectedFolder;
    if (!uploadFolder) {
      setErrorMessage("No folder selected for upload.");
      return;
    }
    const storageRef = ref(
      storage,
      `workspaces/${workspaceId}/folders/${uploadFolder!.id}/${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setErrorMessage("Upload failed. Please try again.");
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

        const filesCollectionRef = collection(
          db,
          "workspaces",
          workspaceId,
          "folders",
          selectedFolder.id,
          "files"
        );
        const newFileRef = doc(filesCollectionRef);
        const fileId = newFileRef.id;

        const fileData: FileData = {
          id: fileId,
          name: file.name,
          url: downloadURL,
          type: fileType,
          fileType: fileExtension,
          folderId: selectedFolder.id,
        };

        await setDoc(newFileRef, fileData);

        onFileUpload(fileData);

        if (fileType === "audio") {
          await triggerAudioTranscription(downloadURL, newFileRef.path);
        }

        if (fileType === "document") {
          await triggerDocumentProcessing(downloadURL, newFileRef.path);
        }

        setIsUploading(false);
        setIsUploadComplete(true);
        setUploadProgress(0);
        setFile(null);
        setSelectedFolder(null);
      }
    );
  };

  const determineFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    return allowedFileTypes[extension] || "other";
  };

  const triggerAudioTranscription = async (
    audioUrl: string,
    fileRef: string
  ) => {
    try {
      const functions = getFunctions();
      const handleAudioUpload = httpsCallable(functions, "handleAudioUpload");
      await handleAudioUpload({ audioUrl, fileRef });
    } catch (error) {
      console.error("Error calling Cloud Function:", error);
    }
  };

  const triggerDocumentProcessing = async (
    documentUrl: string,
    fileRef: string
  ) => {
    try {
      const functions = getFunctions();
      const handleDocumentUpload = httpsCallable(
        functions,
        "handleDocumentUpload"
      );
      await handleDocumentUpload({ documentUrl, fileRef });
    } catch (error) {
      console.error("Error calling Cloud Function:", error);
    }
  };

  const getFileEmoji = (fileName: string | undefined) => {
    if (!fileName) return "📝";
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

  const truncateFileName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExtension = name.slice(0, name.lastIndexOf("."));
    return `${nameWithoutExtension.slice(0, maxLength - 3)}...${extension}`;
  };

  const GradientButton = ({
    onClick,
    children,
    disabled = false,
  }: {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <div
      className={`p-[1px] relative block ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
      <div
        className={`px-4 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black ${
          disabled ? "" : "hover:bg-transparent hover:text-white"
        }`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {" "}
            <FancyText gradient={{ from: "#FE7EF4", to: "#F6B144" }}>
              {" "}
              Upload File
            </FancyText>{" "}
          </h2>
          <button
            title="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-[#F6B144] transition ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-center">Drop the file here ...</p>
          ) : (
            <div>
              <p className="text-center text-md mb-2">
                Drag and drop a file here, or click to select a file
                <p className="text-center text-md text-gray-500 italic">
                  Psst! If you&apos;re new here, make sure to create a folder
                  first. It&apos;s like making a comfy bed for your files before
                  tucking them in!
                </p>
              </p>
            </div>
          )}
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 items-center"
          >
            <span className="text-gray-600 flex items-center">
              {getFileEmoji(file.name)}
              <span className="ml-2">{truncateFileName(file.name, 22)}</span>
            </span>
          </motion.div>
        )}

        {folder === undefined && (
          <div className="mt-4">
            <Select
              options={folders.map((folder) => ({
                value: folder.id,
                label: folder.name,
              }))}
              onChange={(option) =>
                setSelectedFolder(
                  option
                    ? folders.find((f) => f.id === option.value) || null
                    : null
                )
              }
              value={
                selectedFolder
                  ? { value: selectedFolder.id, label: selectedFolder.name }
                  : null
              }
              placeholder="Select a folder"
              className="basic-select"
              classNamePrefix="select"
            />
          </div>
        )}
        <div className="mt-4 flex justify-center items-center">
          <GradientButton
            onClick={handleUpload}
            disabled={
              !file || (folder === undefined && !selectedFolder) || isUploading
            }
          >
            {isUploading ? (
              <>
                <motion.div
                  className="w-5 h-5 mr-2 border-t-2 border-current rounded-full animate-spin"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Uploading...</span>
              </>
            ) : isUploadComplete ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Upload Complete</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5 mr-2" />
                <span>Upload File</span>
              </>
            )}
          </GradientButton>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-500 flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </motion.div>
        )}

        {isUploading && (
          <motion.div
            className="mt-4 bg-gray-200 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
          >
            <motion.div
              className="h-2 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
