import React, { useState } from 'react';

const Skeleton = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prevFiles => [...prevFiles, ...fileNames]);
    }
  };

  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100">
      <input type="file" multiple onChange={handleFileUpload} />
      {uploadedFiles.length > 0 ? (
        <ul>
          {uploadedFiles.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      ) : (
        <div>No files uploaded yet.</div>
      )}
    </div>
  );
};

export default Skeleton;