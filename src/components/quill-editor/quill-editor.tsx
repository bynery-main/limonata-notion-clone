"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import "quill/dist/quill.snow.css";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSocket } from "@/lib/providers/socket-provider";
import { useAuth } from "../auth-provider/AuthProvider";
import { motion } from "framer-motion";
import { GridPattern } from "../ui/resource-creator";
import { toast } from 'react-hot-toast';

interface QuillEditorProps {
  dirDetails: any;
  dirType: "workspace" | "folder" | "file";
  fileId: string;
  workspaceCharCount?: number;
  maxCharCount?: number;
  onCharCountCheck?: (newLength: number, currentLength: number) => boolean;
}

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [ { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
];

// Define Markdown shortcuts
const MARKDOWN_SHORTCUTS = {
  '#': { header: 1 },
  '##': { header: 2 },
  '###': { header: 3 },
  '####': { header: 4 },
  '#####': { header: 5 },
  '######': { header: 6 },
  '*': { list: 'bullet' },
  '-': { list: 'bullet' },
  '+': { list: 'bullet' },
  '1.': { list: 'ordered' },
  '>': { blockquote: true },
  '```': { 'code-block': true },
  '**': { bold: true },
  '__': { bold: true },
  '*_': { italic: true },
  '_*': { italic: true },
  '~~': { strike: true },
};

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  dirType, 
  fileId, 
  dirDetails, 
  workspaceCharCount = 0, 
  maxCharCount = 200000,
  onCharCountCheck 
}) => {
  const [quill, setQuill] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { socket } = useSocket();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const details = useMemo(() => {
    if (dirDetails && dirDetails.workspaceId && dirDetails.folderId) {
      return {
        workspaceId: dirDetails.workspaceId,
        folderId: dirDetails.folderId,
        fileId: fileId,
      };
    }
    return null;
  }, [dirDetails, fileId]);

  const refString = useMemo(() => {
    if (dirDetails && dirDetails.workspaceId && dirDetails.folderId) {
      return `workspaces/${dirDetails.workspaceId}/folders/${dirDetails.folderId}/notes/${fileId}`;
    }
    return "";
  }, [dirDetails, fileId]);

  // Function to start the auto-hide timer
  const startAutoHideTimer = () => {
    if (toolbarTimerRef.current) {
      clearTimeout(toolbarTimerRef.current);
    }
    
    toolbarTimerRef.current = setTimeout(() => {
      setShowToolbar(false);
    }, 3000); // Hide after 3 seconds of inactivity
  };

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current || !details) return;

    const initQuill = async () => {
      wrapperRef.current!.innerHTML = "";
      const editor = document.createElement("div");
      wrapperRef.current!.append(editor);
      const { default: Quill } = await import("quill");
      const QuillCursors = (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursors);
      
      // Create a custom keyboard module for Markdown shortcuts
      const keyboard = {
        bindings: {
          // Add markdown shortcuts
          markdownShortcuts: {
            key: ' ',
            handler: function(this: { quill: any }, range: { index: number, length: number }, context: { prefix: string }) {
              // Get the text before the space
              const line = context.prefix;
              
              // Check if the line starts with a Markdown shortcut
              for (const [pattern, format] of Object.entries(MARKDOWN_SHORTCUTS)) {
                if (line === pattern || line.startsWith(pattern + ' ')) {
                  // Delete the Markdown syntax
                  this.quill.deleteText(range.index - line.length, line.length);
                  
                  // Apply the format
                  if ('header' in format) {
                    this.quill.formatLine(range.index - line.length, 1, 'header', format.header);
                  } else if ('list' in format) {
                    this.quill.formatLine(range.index - line.length, 1, 'list', format.list);
                  } else if ('blockquote' in format) {
                    this.quill.formatLine(range.index - line.length, 1, 'blockquote', true);
                  } else if ('code-block' in format) {
                    this.quill.formatLine(range.index - line.length, 1, 'code-block', true);
                  } else if ('bold' in format) {
                    this.quill.format('bold', true);
                  } else if ('italic' in format) {
                    this.quill.format('italic', true);
                  } else if ('strike' in format) {
                    this.quill.format('strike', true);
                  }
                  
                  return false; // Prevent default space insertion
                }
              }
              return true; // Allow default space insertion
            }
          }
        }
      };
      
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
          keyboard: keyboard,
        },
        placeholder: "Start writing your notes here...",
      });
      setQuill(q);
      
      // Set Urbanist font for the editor
      q.root.style.fontFamily = 'Urbanist, sans-serif';
      
      // Make the font bigger by default
      q.root.style.fontSize = '18px';
      
      // Remove borders from the editor
      q.root.style.border = 'none';
      
      // Initially style the toolbar
      const toolbar = wrapperRef.current!.querySelector('.ql-toolbar');
      if (toolbar) {
        const toolbarEl = toolbar as HTMLElement;
        toolbarEl.style.fontFamily = 'Urbanist, sans-serif';
        toolbarEl.style.fontSize = '25px';
        toolbarEl.style.position = 'absolute';
        toolbarEl.style.top = '0';
        toolbarEl.style.left = '0';
        toolbarEl.style.right = '0';
        toolbarEl.style.zIndex = '10';
        toolbarEl.style.transform = 'translateY(-100%)';
        toolbarEl.style.transition = 'transform 0.3s ease';
        toolbarEl.style.borderRadius = '8px 8px 0 0';
      }

      q.on("text-change", async (delta, oldDelta, source) => {
        if (source !== "user" || !isInitialized) return;

        const text = q.root.innerHTML;
        const newLength = text.length;
        
        // Check character count limit
        const shouldApplyChanges = onCharCountCheck ? 
          onCharCountCheck(newLength, currentLength) : 
          (workspaceCharCount - currentLength + newLength <= maxCharCount);
        
        if (!shouldApplyChanges) {
          // Revert the change
          setIsLimitReached(true);
          // Show toast notification
          toast.error(`Character limit reached (${maxCharCount.toLocaleString()} characters). Please delete some content.`);
          // Use a setTimeout to allow the error message to display before reverting
          setTimeout(() => {
            q.history.undo();
            setIsLimitReached(false);
          }, 10);
          return;
        }
        
        setCurrentLength(newLength);
        console.log("Text change detected:", text);

        if (details) {
          try {
            const fileDocRef = doc(
              db,
              "workspaces",
              details.workspaceId,
              "folders",
              details.folderId,
              "notes",
              details.fileId
            );
            await setDoc(fileDocRef, { 
              text,
              isSynced: false 
            }, { merge: true });
            console.log("Document successfully updated!");
          } catch (error) {
            console.log("Error updating document: ", error);
          }
        }
      });
    };

    initQuill();
    
    // Add hover event listeners to the container
    const container = wrapperRef.current;
    
    const handleMouseEnter = () => {
      setShowToolbar(true);
      startAutoHideTimer();
    };
    
    const handleMouseLeave = () => {
      // Don't immediately hide on mouse leave
      // Let the auto-hide timer handle it
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Only show toolbar when mouse is near the top of the editor
      const topThreshold = 50; // pixels from the top
      if (e.clientY - container.getBoundingClientRect().top < topThreshold) {
        setShowToolbar(true);
        startAutoHideTimer();
      }
    };
    
    if (container) {
      // Remove the general mousemove listener
      // container.addEventListener('mousemove', handleMouseMove);
      
      // Only listen for mouse movements near the top of the container
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (toolbarTimerRef.current) {
        clearTimeout(toolbarTimerRef.current);
      }
    };
  }, [details, onCharCountCheck, workspaceCharCount, maxCharCount, currentLength]);

  // Effect to show/hide toolbar
  useEffect(() => {
    if (!wrapperRef.current) return;
    
    const toolbar = wrapperRef.current.querySelector('.ql-toolbar');
    if (toolbar) {
      const toolbarEl = toolbar as HTMLElement;
      toolbarEl.style.transform = showToolbar ? 'translateY(0)' : 'translateY(-100%)';
    }
  }, [showToolbar]);

  useEffect(() => {
    if (!fileId || !quill || !details) return;

    const fetchInformation = async () => {
      const fileDocRef = doc(
        db,
        "workspaces",
        details.workspaceId,
        "folders",
        details.folderId,
        "notes",
        fileId
      );
      const fileDoc = await getDoc(fileDocRef);

      if (fileDoc.exists()) {
        const fileData = fileDoc.data();
        quill.root.innerHTML = fileData.text || "";
        setCurrentLength(fileData.text?.length || 0);
        console.log("Fetched document data:", fileData);
        setIsInitialized(true);
      } else {
        console.log("No such document!");
        setIsInitialized(true);
      }
    };

    fetchInformation();
  }, [fileId, quill, details]);

  // Socket setup
  useEffect(() => {
    if (!socket || !fileId || !details) return;

    console.log("Creating socket room:", fileId);
    socket.emit("create-room", fileId);

    return () => {
      console.log("Leaving socket room:", fileId);
      socket.emit("leave-room", fileId);
    };
  }, [socket, fileId, details]);

  // Send changes
  useEffect(() => {
    if (quill === null || socket === null || fileId === null || !details || !isInitialized) return;

    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return;

      console.log("Sending changes to socket:", delta);
      socket.emit("send-changes", delta, fileId);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);

      saveTimerRef.current = setTimeout(async () => {
        try {
          const text = quill.root.innerHTML;
          const fileDocRef = doc(
            db,
            "workspaces",
            details.workspaceId,
            "folders",
            details.folderId,
            "notes",
            details.fileId
          );
          await setDoc(fileDocRef, { text }, { merge: true });
          console.log("Document successfully updated after save delay!");
        } catch (error) {
          console.log("Error updating document after save delay: ", error);
        }
        setSaving(false);
      }, 850);
    };

    quill.on("text-change", quillHandler);

    return () => {
      quill.off("text-change", quillHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, details, isInitialized]);

  // Receive changes
  useEffect(() => {
    if (quill === null || socket === null || fileId === null) return;

    const handler = (delta: any) => {
      console.log("Receiving changes from socket:", delta);
      quill.updateContents(delta);
    };

    socket.on(`receive-changes-${fileId}`, handler);

    return () => {
      socket.off(`receive-changes-${fileId}`, handler);
    };
  }, [quill, socket, fileId]);

  if (!details) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7B64F] to-[#F988B4] rounded-full opacity-75 blur-lg"></div>
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-purple-500 rounded-full relative"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-urbanist">Loading your note...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full font-urbanist ">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full h-[70vh] md:h-full flex flex-col"
      >
        <div id="container" className="w-full flex-1 p-4 overflow-hidden rounded-lg backdrop-blur-sm bg-white/60 dark:bg-background/70 shadow-sm relative" ref={wrapperRef}>
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-30 pointer-events-none">
            <GridPattern />
          </div>
        </div>
        {saving && !showToolbar && (
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <div className="animate-spin w-3 h-3 border-t-2 border-b-2 border-purple-500 rounded-full mr-2"></div>
            Saving...
          </div>
        )}
        {isLimitReached && (
          <div className="text-xs text-red-500 mt-2 flex items-center">
            Character limit reached ({maxCharCount.toLocaleString()} characters). Please delete some content.
          </div>
        )}

      </motion.div>
    </div>
  );
}

export default QuillEditor;