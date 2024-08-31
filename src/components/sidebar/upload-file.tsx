import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

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
  ppt: "powerpoint",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ( e.target.files ) {
      setFile(e.target.files[0]);
      setErrorMessage(null); // Clear any previous error message
    }
  };

  const determineFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    return allowedFileTypes[extension] || "other";
  };

  const handleUpload = async () => {
    if ( !file ) return;

    const fileType = determineFileType(file.name);

    // Check if the file type is allowed
    if ( fileType === "other" ) {
      setErrorMessage("This file type is not allowed for upload.");
      return;
    }

    const storageRef = ref(storage, `${folderRef}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        setErrorMessage("Upload failed. Please try again.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

        // Create a new Firestore document with a generated ID
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

        // Trigger appropriate Cloud Function based on file type
        if ( fileType === "audio" ) {
          await triggerAudioTranscription(downloadURL, newFileRef.path);
        }

        if ( fileType === "document" ) {
          await triggerDocumentProcessing(downloadURL, newFileRef.path);
        }

        setUploadProgress(0); // Reset progress after upload is complete
      }
    );
  };

  const saveFileData = async (fileRef: any, fileName: string, fileURL: string, type: string, fileType: string) => {
    const fileData = {
      name: fileName,
      url: fileURL,
      type,
      fileType,
    };

    await setDoc(fileRef, fileData);
    console.log("File data saved to Firestore:", fileData);
  };

  const triggerAudioTranscription = async (audioUrl: string, fileRef: string) => {
    try {
      const functions = getFunctions();
      const handleAudioUpload = httpsCallable(functions, 'handleAudioUpload');
      const response = await handleAudioUpload({ audioUrl, fileRef });

      console.log("Cloud Function response:", response.data);
    } catch (error) {
      console.error("Error calling Cloud Function:", error);
    }
  };

  const triggerDocumentProcessing = async (documentUrl: string, fileRef: string) => {
    try {
      const functions = getFunctions();
      const handleDocumentUpload = httpsCallable(functions, 'handleDocumentUpload');
      const response = await handleDocumentUpload({ documentUrl, fileRef });

      console.log("Cloud Function response:", response.data);
    } catch (error) {
      console.error("Error calling Cloud Function:", error);
    }
  };

  return (
    <div className="upload-file">
      <label htmlFor="fileInput">Choose a file:</label>
      <input id="fileInput" type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        Upload File
      </button>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      {uploadProgress > 0 && <div>Upload Progress: {uploadProgress}%</div>}
    </div>
  );
};

export default UploadFile;
