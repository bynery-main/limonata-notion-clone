import React, { useState } from "react";
import { addNote } from "@/lib/utils";
import { CirclePlusIcon } from "lucide-react";

interface CreateNoteProps {
  workspaceId: string;
  folderId: string;
}

const CreateNote: React.FC<CreateNoteProps> = ({ workspaceId, folderId }) => {
  const [noteName, setNoteName] = useState("");

  const handleCreateNote = async () => {
    await addNote(workspaceId, folderId, noteName);
    setNoteName(""); // Clear the input after creating the note
  };

  return (
    <div>
      <input
        type="text"
        value={noteName}
        onChange={(e) => setNoteName(e.target.value)}
        placeholder="Enter note name"
      />
      <button onClick={handleCreateNote}
            className="bg-white text-black p-2 rounded hover:bg-blue-500 hover:text-white">
            <CirclePlusIcon className="h-4 w-4" />
          </button>

    </div>
  );
};

export default CreateNote;
