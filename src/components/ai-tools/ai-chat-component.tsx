"use client";

import React from "react";
import { CatIcon } from "lucide-react";

const AIChatComponent: React.FC = () => {
  return (
    <button
      className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg mb-2"
    >
      <CatIcon className="w-6 h-6" />
    </button>
  );
};

export default AIChatComponent;
