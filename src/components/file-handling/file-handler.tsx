import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';
import DocumentDisplay from './document-display';
import PowerpointDisplay from './powerpoint-display';
import AudioDisplay from './audio-display';
import ImageDisplay from './image-display';
import Summarise from '@/components/ai-tools/summarise';
import { useAuth } from '../auth-provider/AuthProvider';

interface FileHandlerProps {
  fileName: string;
  fileUrl: string | undefined;
  fileExtension: string | undefined;
  data: any;
  params: { workspaceId: string, folderId: string, fileId: string };
}

const FileHandler: React.FC<FileHandlerProps> = ({ fileName, fileUrl, fileExtension, data, params }) => {
  const refString = `workspaces/${params.workspaceId}/folders/${params.folderId}/files/${params.fileId}`;
  const { user } = useAuth(); // Get the current user from the auth provider

  const renderSummariseButton = () => {
    if (user) {
      return <Summarise refString={refString} type="file" userId={user.uid} />;
    }
    return null; // Don't render the Summarise button if there's no user
  };

  if (fileUrl) {
    console.log('File URL:', fileUrl);
    return (
      <div className="relative">
        <h1 className="text-xl mb-4">{fileName}</h1>
        {fileExtension === 'pdf' || fileExtension === 'docx' ? (
          <>
            <DocumentDisplay fileUrl={fileUrl} fileExtension={fileExtension} />
            {renderSummariseButton()}
          </>
        ) : fileExtension === 'ppt' || fileExtension === 'pptx' ? (
          <>
            <PowerpointDisplay fileUrl={fileUrl} />
            {renderSummariseButton()}
          </>
        ) : fileExtension === 'mp3' || fileExtension === 'wav' ? (
          <>
            <AudioDisplay fileUrl={fileUrl} />
            {renderSummariseButton()}
          </>
        ) : fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif' || fileExtension === 'webp' ? (
          <>
            <ImageDisplay fileUrl={fileUrl} fileName={fileName} />
            {renderSummariseButton()}
          </>
        ) : (
          <div>
            <p>File type not supported for preview. <a href={fileUrl} download>Download</a> the file to view.</p>
            {renderSummariseButton()}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="relative">
        <QuillEditor
          dirType="file"
          fileId={params.fileId}
          dirDetails={{ ...data, workspaceId: params.workspaceId, folderId: params.folderId }}
        />
      </div>
    );
  }
};

export default FileHandler;