import QuillEditor from '@/components/quill-editor/quill-editor';
import { getFileDetails } from '@/lib/queries/queries';
import React from 'react';

export const dynamic = 'force-dynamic';

const File = async ({ params }: { params: { workspaceId: string, folderId: string, fileId: string } }) => {
  const { data } = await getFileDetails(params.fileId);

  return (
    <div className="relative">
      <QuillEditor
        dirType="file"
        fileId={params.fileId}
        dirDetails={{ ...data, workspaceId: params.workspaceId, folderId: params.folderId }}
      />
    </div>
  );
};

export default File;
