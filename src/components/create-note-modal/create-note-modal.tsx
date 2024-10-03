import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';

interface Folder {
  id: string;
  name: string;
}

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  folders: Folder[];
}

const NewNoteModal: React.FC<NewNoteModalProps> = ({ isOpen, onClose, workspaceId, folders }) => {
  const [noteName, setNoteName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setNoteName('');
      setSelectedFolder('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteName.trim() || !selectedFolder) {
      setError('Please enter a note name and select a folder.');
      return;
    }

    setIsLoading(true);
    try {
      const noteRef = collection(db, `workspaces/${workspaceId}/folders/${selectedFolder}/notes`);
      const docRef = await addDoc(noteRef, {
        name: noteName,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      onClose();
      // Navigate to the newly created note
      router.push(`/dashboard/${workspaceId}/${selectedFolder}/${docRef.id}`);
    } catch (error) {
      console.error("Error creating note:", error);
      setError('An error occurred while creating the note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        className="bg-white rounded-lg shadow-xl w-96 p-6 relative z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Create New Note</h2>
        <form onSubmit={handleCreateNote}>
          <div className="mb-4">
            <label htmlFor="noteName" className="block text-sm font-medium text-gray-700">Note Name</label>
            <input
              type="text"
              id="noteName"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700">Select Folder</label>
            <select
              id="folder"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Select a folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Creating...
              </>
            ) : (
              'Create Note'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewNoteModal;