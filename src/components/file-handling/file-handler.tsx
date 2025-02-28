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

  if (fileUrl) {
    console.log('File URL:', fileUrl);
    return (
      <div className="relative h-full">
        {fileExtension === 'pdf' || fileExtension === 'docx' ? (
          <DocumentDisplay fileUrl={fileUrl} fileExtension={fileExtension} />
        ) : fileExtension === 'ppt' || fileExtension === 'pptx' ? (
          <PowerpointDisplay fileUrl={fileUrl} />
        ) : fileExtension === 'mp3' || fileExtension === 'wav' ? (
          <AudioDisplay fileUrl={fileUrl} />
        ) : fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif' || fileExtension === 'webp' ? (
          <ImageDisplay fileUrl={fileUrl} fileName={fileName} />
        ) : (
          <div>
            <p>File type not supported for preview. <a href={fileUrl} download>Download</a> the file to view.</p>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="relative h-full flex flex-col">
        <div className="flex-grow overflow-auto">
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