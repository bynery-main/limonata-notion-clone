import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';
import PdfDisplay from './pdf-display';
import AudioDisplay from './audio-display';

interface FileHandlerProps {
  fileName: string;
  fileUrl: string | undefined;
  fileExtension: string | undefined;
  data: any;
  params: { workspaceId: string, folderId: string, fileId: string };
}

const FileHandler: React.FC<FileHandlerProps> = ({ fileName, fileUrl, fileExtension, data, params }) => {
  if (fileUrl) {
    console.log('File URL:', fileUrl);
    return (
      <div className="relative">
        <h1 className="text-xl mb-4">{fileName}</h1>
        {fileExtension === 'pdf' ? (
          <PdfDisplay fileUrl={fileUrl} />
        ) : fileExtension === 'mp3' || fileExtension === 'wav' ? (
          <AudioDisplay fileUrl={fileUrl} />
        ) : (
          <div>
            <p>File type not supported for preview. <a href={fileUrl} download>Download</a> the file to view.</p>
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
