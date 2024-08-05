import React, { useState } from "react";
import { addNote } from "@/lib/utils";

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
      <button onClick={handleCreateNote}>Create Note</button>
    </div>
  );
};

export default CreateNote;
