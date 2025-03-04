import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';
import DocumentDisplay from './document-display';
import PowerpointDisplay from './powerpoint-display';
import AudioDisplay from './audio-display';
import ImageDisplay from './image-display';
import { useAuth } from '../auth-provider/AuthProvider';

interface FileHandlerProps {
  fileName: string;
  fileUrl: string | undefined;
  fileExtension: string | undefined;
  data: any;
  params: { workspaceId: string; folderId: string; fileId: string };
}

const FileHandler: React.FC<FileHandlerProps> = ({ fileName, fileUrl, fileExtension, data, params }) => {
  const { user } = useAuth();
  
  // For debugging only
  console.log('FileHandler props:', { fileName, fileUrl, fileExtension, data });

  // Use fileUrl from props or data.url as fallback
  const effectiveUrl = fileUrl || data?.url;
  
  // Extract file extension from filename if not provided
  const derivedExtension = fileExtension || fileName.split('.').pop()?.toLowerCase();
  
  // Determine if this is a file that should be displayed with a viewer based on extension
  const isViewableFile = ['pdf', 'docx', 'ppt', 'pptx', 'mp3', 'wav', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(derivedExtension || '');
  
  // If it has an effective URL, it's a file that can be displayed
  if (effectiveUrl) {
    console.log('Rendering file with URL:', effectiveUrl);
    return (
      <div className="relative h-full">
        {derivedExtension === 'pdf' || derivedExtension === 'docx' ? (
          <DocumentDisplay fileUrl={effectiveUrl} fileExtension={derivedExtension} />
        ) : derivedExtension === 'ppt' || derivedExtension === 'pptx' ? (
          <PowerpointDisplay fileUrl={effectiveUrl} />
        ) : derivedExtension === 'mp3' || derivedExtension === 'wav' ? (
          <AudioDisplay fileUrl={effectiveUrl} />
        ) : derivedExtension === 'jpg' || derivedExtension === 'jpeg' || derivedExtension === 'png' || derivedExtension === 'gif' || derivedExtension === 'webp' ? (
          <ImageDisplay fileUrl={effectiveUrl} fileName={fileName} />
        ) : (
          <div>
            <p>File type not supported for preview. <a href={effectiveUrl} download>Download</a> the file to view.</p>
          </div>
        )}
      </div>
    );
  } 
  // If it's a viewable file type but doesn't have a URL, show an error message
  else if (isViewableFile) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-md max-w-md text-center">
          <h3 className="text-lg font-medium mb-2">File Preview Unavailable</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The file &quot;{fileName}&quot; cannot be previewed because the URL is missing.
          </p>
          <p className="text-sm text-gray-500">
            This may be because the file was uploaded with a different method or the storage link has expired.
          </p>
        </div>
      </div>
    );
  }
  // If it's not a viewable file type, it's a note
  else {
    console.log('Rendering note with QuillEditor');
    return (
      <div className="relative h-full flex flex-col">
        <div className="flex-grow overflow-auto mx-auto">
          <QuillEditor
            dirType="file"
            fileId={params.fileId}
            dirDetails={{ ...data, workspaceId: params.workspaceId, folderId: params.folderId }}
          />
        </div>
      </div>
    );
  }
};

export default FileHandler;