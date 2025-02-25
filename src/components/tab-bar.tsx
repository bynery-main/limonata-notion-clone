"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onChange }) => {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    width: 0,
    left: 0,
  });

  useEffect(() => {
    // Update indicator position when activeTab changes
    const activeTabElement = tabRefs.current.get(activeTab);
    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft,
      });
    }
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 mb-6">
      <div className="flex justify-between rounded-3xl bg-gray-100 p-1 relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => onChange(tab.id)}
            className={`flex items-center px-6 py-2.5 text-sm font-medium transition-all relative rounded-2xl flex-1 justify-center ${
              activeTab === tab.id 
              ? "text-black" 
              : "hover:text-gray-900 text-gray-400"
            }`}
          >
            <div className="relative flex items-center z-10">
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </div>
          </button>
        ))}
        <motion.div 
          className="absolute inset-y-1 rounded-3xl"
          style={{
            boxShadow: "0 0 0 2px transparent",
            backgroundImage: "linear-gradient(white, white), linear-gradient(to right, #F6B144, #FE7EF4)",
            backgroundOrigin: "border-box",
            backgroundClip: "content-box, border-box",
            border: "1px solid transparent",
          }}
          initial={false}
          animate={{
            width: indicatorStyle.width,
            x: indicatorStyle.left,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30 
          }}
        />
      </div>
    </div>
  );
};

export default TabBar; 