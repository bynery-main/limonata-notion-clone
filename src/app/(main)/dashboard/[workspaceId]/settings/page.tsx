'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import Picker from '@emoji-mart/react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/components/auth-provider/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Trash2, RefreshCw, X } from 'lucide-react';
import { db } from "@/firebase/firebaseConfig";

const SettingsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("💼");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { user } = useAuth();
  const currentUserUid = user?.uid || "";

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const idIndex = pathParts.indexOf('dashboard') + 1;
      if (idIndex > 0 && pathParts[idIndex]) {
        setWorkspaceId(pathParts[idIndex]);
        fetchWorkspaceDetails(pathParts[idIndex]);
      }
    }
  }, [pathname]);

  const fetchWorkspaceDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const workspaceDoc = doc(db, "workspaces", id);
      const docSnap = await getDoc(workspaceDoc);

      if (docSnap.exists()) {
        const workspaceData = docSnap.data();
        setTitle(workspaceData.name || "");
        setDescription(workspaceData.description || "");
        setEmoji(workspaceData.emoji || "💼");
      } else {
        toast.error("Workspace not found.");
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
      toast.error("Failed to load workspace details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!workspaceId) {
      toast.error('Workspace ID not found.');
      return;
    }

    setIsSaving(true);
    try {
      const workspaceDoc = doc(db, "workspaces", workspaceId);
      await updateDoc(workspaceDoc, {
        name: title,
        description: description,
        emoji: emoji,
      });
      toast.success('Workspace updated successfully.');
    } catch (error) {
      console.error("Error updating workspace:", error);
      toast.error('Failed to update workspace. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) {
      toast.error('Workspace ID not found.');
      return;
    }

    setIsDeleting(true);
    const functions = getFunctions();
    const deleteWorkspace = httpsCallable(functions, "deleteWorkspace");

    try {
      await deleteWorkspace({ workspaceId });
      toast.success('Workspace deleted successfully.');
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error('Error deleting workspace. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Toaster />
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Workspace Settings</CardTitle>
          <CardDescription>Manage your workspace details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="emoji" className="block text-sm font-medium text-gray-700">
                  Emoji
                </label>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-4xl mr-3 focus:outline-none"
                >
                  <span>{emoji}</span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-10 mt-2">
                    <Picker onEmojiSelect={handleEmojiSelect} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24"
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="p-[1px] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7B64F] to-[#F988B4] rounded-lg" />
            <div className="px-8 py-2 bg-white rounded-[6px] relative group transition duration-200 text-black hover:bg-transparent hover:text-white flex items-center">
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </div>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Workspace
          </button>
        </CardFooter>
      </Card>

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold mb-4">Delete Workspace</h3>
              <p className="mb-6">Are you sure you want to delete this workspace? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkspace}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
