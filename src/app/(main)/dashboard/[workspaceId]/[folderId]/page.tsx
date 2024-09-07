export const dynamic = 'force-dynamic';

import QuillEditor from '@/components/quill-editor/quill-editor';
import { getFolderDetails } from '@/lib/queries/queries';
import { redirect } from 'next/navigation';
import React from 'react';

const Folder = async ({ params }: { params: { folderId: string } }) => {
  const { data } = await getFolderDetails(params.folderId);

  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
      <QuillEditor
        dirType="folder"
        fileId={params.folderId}
        dirDetails={data || {}}
      />
    </div>
  );
};

export default Folder;