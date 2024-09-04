"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import "quill/dist/quill.snow.css";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSocket } from "@/lib/providers/socket-provider";
import { useAuth } from "../auth-provider/AuthProvider";
import Summarise from "../ai-tools/summarise";

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

  const details = useMemo(() => {
    return {
      workspaceId: dirDetails.workspaceId,
      folderId: dirDetails.folderId,
      fileId: fileId,
    };
  }, [dirDetails, fileId]);

  const refString = `workspaces/${dirDetails.workspaceId}/folders/${dirDetails.folderId}/notes/${fileId}`;

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

      q.on("text-change", async () => {
        const text = q.root.innerHTML;
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
          await setDoc(fileDocRef, { text }, { merge: true });
          console.log("Document successfully updated!");
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
      const fileDocRef = doc(
        db,
        "workspaces",
        dirDetails.workspaceId,
        "folders",
        dirDetails.folderId,
        "notes",
        fileId
      );
      const fileDoc = await getDoc(fileDocRef);

      if (fileDoc.exists()) {
        const fileData = fileDoc.data();
        quill.root.innerHTML = fileData.text || "";
        console.log("Document data:", fileData);
      } else {
        console.log("No such document!");
      }
    };

    fetchInformation();
  }, [fileId, quill, dirDetails]);

  // Socket setup
  useEffect(() => {
    if (!socket || !dirDetails) return;
    socket.emit("create-room", fileId);
    return () => {
      socket.emit("leave-room", fileId);
    };
  }, [socket, fileId, dirDetails]);

  // Send changes
  useEffect(() => {
    if (quill === null || socket === null || fileId === null) return;

    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return;

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
      socket.emit("send-changes", delta, fileId);
    };

    quill.on("text-change", quillHandler);

    return () => {
      quill.off("text-change", quillHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, details]);

  return (
    <div className="flex w-full h-full">
      <div className="w-5/6 min-w-[600px]">
        <div id="container" className="w-full pl-6 h-[calc(100vh-64px)]" ref={wrapperRef}></div>
      </div>
      <div className="w-1/6 p-4">
        {/* Pass the constructed reference and type */}
        <Summarise refString={refString} type="note" />
      </div>
    </div>
  );
};

export default QuillEditor;
