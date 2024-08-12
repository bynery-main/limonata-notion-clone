import React, { useState } from "react";
import { addNote } from "@/lib/utils";
import { CirclePlusIcon } from "lucide-react";

interface CreateNoteProps {
  workspaceId: string;
  folderId: string;
  onNoteCreated?: () => void;  // New optional prop
}

const CreateNote: React.FC<CreateNoteProps> = ({ workspaceId, folderId, onNoteCreated }) => {
  const [noteName, setNoteName] = useState("");

  const handleCreateNote = async () => {
    if (noteName.trim() === "") return;  // Don't create empty notes
    
    await addNote(workspaceId, folderId, noteName);
    setNoteName(""); // Clear the input after creating the note
    
    // Call the onNoteCreated callback if it exists
    if (onNoteCreated) {
      onNoteCreated();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={noteName}
        onChange={(e) => setNoteName(e.target.value)}
        placeholder="Enter note name"
        className="border p-2 rounded"
      />
      <button 
        onClick={handleCreateNote}
        className="bg-white text-black p-2 rounded hover:bg-blue-500 hover:text-white"
      >
        <CirclePlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CreateNote;