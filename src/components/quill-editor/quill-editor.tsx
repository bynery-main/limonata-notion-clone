"use client"

import React, { useEffect, useState, useRef, useMemo } from "react";
import "quill/dist/quill.snow.css";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSocket } from "@/lib/providers/socket-provider";
import { useAuth } from "../auth-provider/AuthProvider";
import { StarsIcon } from "lucide-react";

interface QuillEditorProps {
  dirDetails: any;
  dirType: "workspace" | "folder" | "file";
  fileId: string;
}

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
];

const QuillEditor: React.FC<QuillEditorProps> = ({ dirType, fileId, dirDetails }) => {
  const [quill, setQuill] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { socket } = useSocket();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const details = useMemo(() => {
    return {
      workspaceId: dirDetails.workspaceId,
      folderId: dirDetails.folderId,
      fileId: fileId
    };
  }, [dirDetails, fileId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (wrapperRef.current == null) return;

    const initQuill = async () => {
      wrapperRef.current!.innerHTML = "";
      const editor = document.createElement("div");
      wrapperRef.current!.append(editor);
      const { default: Quill } = await import("quill");
      const QuillCursors = (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursors);
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
        placeholder: "Start writing your notes here...",
      });
      setQuill(q);

      // Custom CSS for the placeholder
      const style = document.createElement('style');
      style.innerHTML = `
        .ql-editor.ql-blank::before {
          font-style: normal;
          font-weight: 300;
        }
      `;
      document.head.appendChild(style);

      q.on("text-change", async () => {
        const text = q.root.innerHTML;
        try {
          if (details.workspaceId && details.folderId && details.fileId) {
            const fileDocRef = doc(db, "workspaces", details.workspaceId, "folders", details.folderId, "notes", details.fileId);
            await setDoc(fileDocRef, { text }, { merge: true });
            console.log("Document successfully updated!");
          }
        } catch (error) {
          console.log("Error updating document: ", error);
        }
      });
    };

    initQuill();
  }, [details]);

  useEffect(() => {
    if (!fileId || !quill) return;

    const fetchInformation = async () => {
      if (dirType === "file") {
        const fileDocRef = doc(db, "workspaces", dirDetails.workspaceId, "folders", dirDetails.folderId, "notes", fileId);
        const fileDoc = await getDoc(fileDocRef);

        if (fileDoc.exists()) {
          const fileData = fileDoc.data();
          quill.root.innerHTML = fileData.text || "";
          console.log("Document data:", fileData);
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchInformation();
  }, [fileId, dirType, quill, dirDetails]);

  // Rooms
  useEffect(() => {
    if (!socket || !dirDetails) return;
    socket.emit("create-room", fileId);
    console.log("Room created for file:", fileId);
    return () => {
      socket.emit("leave-room", fileId);
    };
  }, [socket, quill, dirDetails]);

  // Send changes to all clients
  useEffect(() => {
    if (quill === null || socket === null || fileId === null) return;

    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== 'user') return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId) {
          try {
            const text = quill.root.innerHTML;
            const fileDocRef = doc(db, "workspaces", details.workspaceId, "folders", details.folderId, "notes", details.fileId);
            await setDoc(fileDocRef, { text }, { merge: true });
            console.log("Document successfully updated in the save function!");
          } catch (error) {
            console.log("Error updating document in the save function: ", error);
          }
        }
        setSaving(false);
      }, 850);
      socket.emit("send-changes", delta, fileId);
    };

    quill.on("text-change", quillHandler);

    return () => {
      quill.off("text-change", quillHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, details]);

  // Receive changes from other clients
  useEffect(() => {
    if (quill === null || socket === null || fileId === null) return;

    const receiveChangesHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        console.log("Received changes for the same file:", deltas);
        quill.updateContents(deltas);
      }
    };

    socket.on("receive-changes", receiveChangesHandler);

    return () => {
      socket.off("receive-changes", receiveChangesHandler);
    };
  }, [quill, socket, fileId]);

 
  return (
    <div className="flex w-full h-full">
      <div className="w-5/6 min-w-[600px]">
        <div id="container" className="w-full pl-6 h-[calc(100vh-64px)]" ref={wrapperRef}></div>
      </div>
      <div className="w-1/6 p-4">
        <div className="mb-6">
          <button 
            className="p-[2px] relative transition-transform duration-300 ease-in-out transform hover:scale-105"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
            <div className={`px-4 py-2 bg-white rounded-[6px] relative duration-300 ${isHovered ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'text-purple-500'}`}>
              <div className="text-lg flex items-center">
                <StarsIcon className={`w-4 h-4 mr-2 transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} />
                Summarize
              </div>
            </div>
          </button>
        </div>
        <div>
          <h3 className="text-sm font-light mb-2 text-gray-400">RELATED NOTES</h3>
          <ul className="list-disc pl-5 font-light">
            <li>Note 1</li>
            <li>Note 2</li>
            <li>Note 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuillEditor;