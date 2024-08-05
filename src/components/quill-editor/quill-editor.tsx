"use client"

import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import "quill/dist/quill.snow.css";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

  const details = useMemo(() => {
    return {
      workspaceId: dirDetails.workspaceId,
      folderId: dirDetails.folderId,
      fileId: fileId
    };
  }, [dirDetails]);

  console.log("Details: ", dirDetails);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (wrapperRef.current == null) return;

    const initQuill = async () => {
      wrapperRef.current!.innerHTML = "";
      const editor = document.createElement("div");
      wrapperRef.current!.append(editor);
      const { default: Quill } = await import("quill");
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
      });
      setQuill(q);

      q.on("text-change", async () => {
        const text = q.root.innerHTML;
        try {

          if (details && details.workspaceId && details.folderId && details.fileId) {
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
          quill.setContents(fileData.content || {});
          console.log("Document data:", fileData);
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchInformation();
  }, [fileId, dirType, quill, dirDetails]);

  return (
    <div className="
      flex
      justify-center
      items-center
      flex-col
      mt-2
      relative
    ">
      <div id="container" className="max-w-[800px]" ref={wrapperRef}></div>
    </div>
  );
};

export default QuillEditor;
