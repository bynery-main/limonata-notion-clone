import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { UploadIcon, CheckCircle, AlertCircle, FileIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
  fileType: string;
}

interface UploadFileProps {
  folderRef: string;
  onFileUpload: (file: FileData) => void;
}

const allowedFileTypes: { [key: string]: string } = {
  mp3: "audio",
  wav: "audio",
  pdf: "document",
  docx: "document",
  pptx: "powerpoint",
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
};

const UploadFile: React.FC<UploadFileProps> = ({ folderRef, onFileUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const fileType = determineFileType(selectedFile.name);
      
      // Check file size
      if (fileType === "document" && selectedFile.size > 2 * 1024 * 1024) {
        setErrorMessage("Document files must be under 2MB.");
        return;
      }
      if (fileType === "audio" && selectedFile.size > 50 * 1024 * 1024) {
        setErrorMessage("Audio files must be under 50MB.");
        return;
      }
      if (fileType === "powerpoint" && selectedFile.size > 50 * 1024 * 1024) {
        setErrorMessage("Powerpoint files must be under 50MB.");
        return;
      }

      setFile(selectedFile);
      setErrorMessage(null);
      setIsUploadComplete(false);
    }
  };

  const determineFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    return allowedFileTypes[extension] || "other";
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileType = determineFileType(file.name);

    if (fileType === "other") {
      setErrorMessage("This file type is not allowed for upload.");
      return;
    }

    // Double-check file size before upload
    if (fileType === "document" && file.size > 2 * 1024 * 1024) {
      setErrorMessage("Document files must be under 2MB.");
      return;
    }
    
    if (fileType === "audio" && file.size > 50 * 1024 * 1024) {
      setErrorMessage("Audio files must be under 50MB.");
      return;
    }

    setIsUploading(true);
    const storageRef = ref(storage, `${folderRef}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

        const newFileRef = doc(collection(db, folderRef, "files"));
        const fileId = newFileRef.id;

        await saveFileData(newFileRef, file.name, downloadURL, fileType, fileExtension);

        onFileUpload({
          id: fileId,
          name: file.name,
          url: downloadURL,
          type: fileType,
          fileType: fileExtension,
        });

        if (fileType === "audio") {
          await triggerAudioTranscription(downloadURL, newFileRef.path);
        }

        if (fileType === "document") {
          await triggerDocumentProcessing(downloadURL, newFileRef.path);
        }

        setIsUploading(false);
        setIsUploadComplete(true);
        setUploadProgress(0);
      }
    );
  };

  const saveFileData = async (fileRef: any, fileName: string, fileURL: string, type: string, fileType: string) => {
    const fileData = { name: fileName, url: fileURL, type, fileType };
    await setDoc(fileRef, fileData);
  };

  const triggerAudioTranscription = async (audioUrl: string, fileRef: string) => {
    try {
      const functions = getFunctions();
      const handleAudioUpload = httpsCallable(functions, 'handleAudioUpload');
      await handleAudioUpload({ audioUrl, fileRef });
    } catch (error) {
      console.error("Error calling Cloud Function:", error);
    }
  };

  const triggerDocumentProcessing = async (documentUrl: string, fileRef: string) => {
    try {
      const functions = getFunctions();
      const handleDocumentUpload = httpsCallable(functions, 'handleDocumentUpload');
      await handleDocumentUpload({ documentUrl, fileRef });
    } catch (error) {
      console.error("Error calling Cloud Function:", error);
    }
  };

  const truncateFileName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExtension = name.slice(0, name.lastIndexOf('.'));
    return `${nameWithoutExtension.slice(0, maxLength - 3)}...${extension}`;
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
  const GradientButton = ({ onClick, children, disabled = false }: { onClick?: () => void, children: React.ReactNode, disabled?: boolean }) => (
    <div className={`p-[1px] relative block ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={disabled ? undefined : onClick}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
      <div className={`px-4 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black ${disabled ? '' : 'hover:bg-transparent hover:text-white'}`}>
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {children}
        </div>
      </div>
    </div>
  );


  return (
    <div className="upload-file bg-white p-6 rounded-lg shadow-md">
      <AnimatePresence>
        {!file && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <label htmlFor="fileInput" className="block mb-2 font-semibold text-gray-700">
              Choose a file:
            </label>
            <label htmlFor="fileInput">
              <GradientButton>
                <FileIcon className="w-5 h-5 mr-2" />
                <span>Select File</span>
              </GradientButton>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        id="fileInput"
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
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
          <div className="mt-4">
            <GradientButton onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <motion.div
                  className="w-5 h-5 mr-2 border-t-2 border-current rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : isUploadComplete ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <UploadIcon className="w-5 h-5 mr-2" />
              )}
              <span>{isUploading ? "Uploading..." : isUploadComplete ? "Upload Complete" : "Upload File"}</span>
            </GradientButton>
          </div>
          <div className="flex justify-center mt-2">

          <label
            htmlFor="fileInput"
            className="cursor-pointer text-[#F6B144] hover:text-[#FE7EF4]
             transition-colors duration-300 mt-2 inline-block">
            Choose another file
          </label>
          </div>
        </motion.div>
      )}
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
  );
};

export default UploadFile;