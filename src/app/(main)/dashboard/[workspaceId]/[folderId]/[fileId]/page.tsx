export const dynamic = 'force-dynamic';

import QuillEditor from '@/components/quill-editor/quill-editor';
import { getFileDetails } from '@/lib/queries/queries';
import { redirect } from 'next/navigation';
import React from 'react';

const File = async ({ params }: { params: { fileId: string } }) => {
  const { data } = await getFileDetails(params.fileId);

  return (
    <div className="relative">
      <QuillEditor
        dirType="file"
        fileId={params.fileId}
        dirDetails={data || {}}
      />
    </div>
  );
};

export default File;
