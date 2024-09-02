'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getFunctions, httpsCallable } from "firebase/functions";
import { Toaster, toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/components/auth-provider/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Trash2, RefreshCw } from 'lucide-react';

const SettingsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("💼");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    // Simulating API call to fetch workspace details
    setTimeout(() => {
      setTitle("My Workspace");
      setDescription("This is a sample workspace description.");
      setEmoji("💼");
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Simulating API call to save workspace changes
    setTimeout(() => {
      toast.success('Workspace updated successfully.');
      setIsSaving(false);
    }, 1500);
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) {
      toast.error('Workspace ID not found.');
      return;
    }

    const functions = getFunctions();
    const deleteWorkspace = httpsCallable(functions, "deleteWorkspace");

    try {
      const result = await deleteWorkspace({ workspaceId });
      toast.success('Workspace deleted successfully.');
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error('Error deleting workspace. Please try again.');
    }
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
                <Input
                  id="emoji"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-16 text-2xl text-center"
                />
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
          <Button
            onClick={handleSaveChanges}
            className="bg-[#ff5924] text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-[#e54e1f] transition-colors"
            disabled={isSaving}
          >
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
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All data associated with this workspace will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-red-600 text-white hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SettingsPage;