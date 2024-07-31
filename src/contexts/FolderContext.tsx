import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}

interface FileData {
  id: string;
  name: string;
  url: string;
}

interface FolderContextProps {
  currentFolder: Folder | null;
  setCurrentFolder: (folder: Folder) => void;
}

const FolderContext = createContext<FolderContextProps | undefined>(undefined);

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolder must be used within a FolderProvider');
  }
  return context;
};

export const FolderProvider = ({ children }: { children: ReactNode }) => {
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

  return (
    <FolderContext.Provider value={{ currentFolder, setCurrentFolder }}>
      {children}
    </FolderContext.Provider>
  );
};
