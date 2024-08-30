import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";

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

const UploadFile: React.FC<UploadFileProps> = ({ folderRef, onFileUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const determineFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    const fileTypeMap: { [key: string]: string } = {
      mp3: "audio",
      wav: "audio",
      pdf: "document",
      doc: "document",
      docx: "document",
      ppt: "powerpoint",
      pptx: "powerpoint",
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      webp: "image",
      mp4: "video",
      avi: "video",
      mov: "video",
      wmv: "video",
    };

    return fileTypeMap[extension] || "other";
  };

  const handleUpload = async () => {
    if (!file) return;

    const storageRef = ref(storage, `${folderRef}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const fileType = determineFileType(file.name);
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

        await saveFileData(file.name, downloadURL, fileType, fileExtension);

        onFileUpload({
          id: file.name,
          name: file.name,
          url: downloadURL,
          type: fileType,
          fileType: fileExtension,
        });

        setUploadProgress(0); // Reset progress after upload is complete
      }
    );
  };

  const saveFileData = async (fileName: string, fileURL: string, type: string, fileType: string) => {
    const fileData = {
      name: fileName,
      url: fileURL,
      type,
      fileType,
    };

    const filesRef = collection(db, folderRef, "files");
    const newFileRef = doc(filesRef);

    await setDoc(newFileRef, fileData);
    console.log("File data saved to Firestore:", fileData);
  };

  return (
    <div className="upload-file">
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        Upload File
      </button>
      {uploadProgress > 0 && <div>Upload Progress: {uploadProgress}%</div>}
    </div>
  );
};

export default UploadFile;
