//Folder Component Interfaces
interface FileData {
  id: string;
  name: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  contents: any[];
  files: FileData[];
}

interface FolderComponentProps {
  folder: Folder;
  parentFolderId?: string;
  workspaceId: string;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  deleteFolder: (
    workspaceId: string,
    folderId: string,
    parentFolderId?: string
  ) => Promise<void>;
  deleteFile: (
    workspaceId: string,
    folderId: string,
    fileId: string
  ) => Promise<void>;
  isActive: boolean;
  onSelect: () => void;
  openFolderId: string | null;
  setOpenFolderId: (folderId: string | null) => void;
}


// // Folders Dropdown Component Interfaces
// interface FoldersDropDownProps {
//   workspaceId: string;
//   onFoldersUpdate: (folders: Folder[]) => void;
//   currentFolderId: string;
//   onFolderSelect: (folderId: string) => void;
// }
