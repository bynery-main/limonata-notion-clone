export const dynamic = 'force-dynamic';

import { getFolderDetails } from '@/lib/queries/queries';
import { redirect } from 'next/navigation';
import React from 'react';

const Folder = async ({ params }: { params: { folderId: string } }) => {
  const { data } = await getFolderDetails(params.folderId);

  return (
    <div className="relative">

    </div>
  );
};

export default Folder;
