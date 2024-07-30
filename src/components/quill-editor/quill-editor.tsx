"use client";

import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  dirDetails: any;
  dirType: "workspace" | "folder" | "file";
  fileId: string;
}

var TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirType,
  fileId,
  dirDetails,
}) => {
  const [quill, setQuill] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const details = useMemo(() => {
    let selectedDir;

    if (dirType === "file") {

    }

    if (dirType === "folder") {

    }

    if (dirType === "workspace") {

    }
  }, [])

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
    };

    initQuill();
  }, []);

  return (
    <div
      className="
        flex
        justify-center
        items-center
        flex-col
        mt-2
        relative
        "
    >
      <div id="container" className="max-w-[800px]" ref={wrapperRef}></div>
    </div>
  );
};

export default QuillEditor;
