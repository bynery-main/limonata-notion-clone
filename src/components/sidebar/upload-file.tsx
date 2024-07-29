import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";

interface FileData {
  id: string;
  name: string;
  url: string;
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
        await saveFileData(file.name, downloadURL);
        console.log("File available at", downloadURL);

        onFileUpload({
          id: file.name,
          name: file.name,
          url: downloadURL,
        });

        setUploadProgress(0); // Reset progress after upload is complete
      }
    );
  };

  const saveFileData = async (fileName: string, fileURL: string) => {
    const fileData = {
      name: fileName,
      url: fileURL,
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
