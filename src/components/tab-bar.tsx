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
      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => onChange(tab.id)}
            className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all relative rounded-lg ${
              activeTab === tab.id 
              ? "text-white" 
              : "hover:text-gray-900 text-gray-600"
            }`}
          >
            <div className="relative flex items-center z-10">
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </div>
          </button>
        ))}
        <motion.div 
          className="absolute inset-y-1 rounded-lg bg-gradient-to-r from-[#F6B144] to-[#FE7EF4]"
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