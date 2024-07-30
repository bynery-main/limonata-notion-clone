import React from "react";

interface QuillEditorProps {
    dirType: string;
    fileId: string;
    dirDetails: any; // Adjust type according to your actual data structure
}

const QuillEditor: React.FC<QuillEditorProps> = ({ dirType, fileId, dirDetails }) => {
    // Your component logic here
    return (
      <div>
        Quill Component
      </div>
    );
  };

export default QuillEditor; 