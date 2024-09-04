import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';
import DocumentDisplay from './document-display';
import PowerpointDisplay from './powerpoint-display';
import AudioDisplay from './audio-display';
import ImageDisplay from './image-display';
import Summarise from '@/components/ai-tools/summarise';

interface FileHandlerProps {
  fileName: string;
  fileUrl: string | undefined;
  fileExtension: string | undefined;
  data: any;
  params: { workspaceId: string, folderId: string, fileId: string };
}

const FileHandler: React.FC<FileHandlerProps> = ({ fileName, fileUrl, fileExtension, data, params }) => {
  const refString = `workspaces/${params.workspaceId}/folders/${params.folderId}/files/${params.fileId}`;

  if (fileUrl) {
    console.log('File URL:', fileUrl);
    return (
      <div className="relative">
        <h1 className="text-xl mb-4">{fileName}</h1>
        {fileExtension === 'pdf' || fileExtension === 'docx' ? (
          <>
            <DocumentDisplay fileUrl={fileUrl} fileExtension={fileExtension} />
            <Summarise refString={refString} type="file" /> {/* Add summarise button for files */}
          </>
        ) : fileExtension === 'ppt' || fileExtension === 'pptx' ? (
          <>
            <PowerpointDisplay fileUrl={fileUrl} />
            <Summarise refString={refString} type="file" /> {/* Add summarise button for files */}
          </>
        ) : fileExtension === 'mp3' || fileExtension === 'wav' ? (
          <>
            <AudioDisplay fileUrl={fileUrl} />
            <Summarise refString={refString} type="file" /> {/* Add summarise button for files */}
          </>
        ) : fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif' || fileExtension === 'webp' ? (
          <>
            <ImageDisplay fileUrl={fileUrl} fileName={fileName} />
            <Summarise refString={refString} type="file" /> {/* Add summarise button for images */}
          </>
        ) : (
          <div>
            <p>File type not supported for preview. <a href={fileUrl} download>Download</a> the file to view.</p>
            <Summarise refString={refString} type="file" /> {/* Add summarise button for unsupported files */}
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
        <Summarise
          refString={`workspaces/${params.workspaceId}/folders/${params.folderId}/notes/${params.fileId}`}
          type="note"
        /> {/* Summarise for notes */}
      </div>
    );
  }
};

export default FileHandler;
