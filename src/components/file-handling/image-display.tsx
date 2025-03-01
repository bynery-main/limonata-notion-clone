import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import FancyText from '@carefully-coded/react-text-gradient';

interface ImageDisplayProps {
  fileUrl: string;
  fileName: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ fileUrl, fileName }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Reset zoom and rotation when exiting fullscreen
    if (isFullscreen) {
      setScale(1);
      setRotation(0);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white/95 dark:bg-neutral-800/95 backdrop-filter backdrop-blur-sm rounded-lg shadow-xl">
      {/* Header with file name */}

      
      {/* Image container */}
      <div 
        className={`relative flex-grow flex items-center justify-center p-4 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90' : ''}`}
        onClick={isFullscreen ? toggleFullscreen : undefined}
      >
        <div className="flex items-center justify-center w-full h-full">
          <motion.div
            className="relative flex items-center justify-center"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <img 
              src={fileUrl} 
              alt={fileName} 
              className="max-h-[calc(100vh-200px)] max-w-full object-contain cursor-zoom-in"
              onClick={isFullscreen ? undefined : toggleFullscreen}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center space-x-4">
        <motion.button
          onClick={zoomIn}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </motion.button>
        
        <motion.button
          onClick={zoomOut}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </motion.button>
        
        <motion.button
          onClick={rotate}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Rotate"
        >
          <RotateCw size={20} />
        </motion.button>
        
        <motion.button
          onClick={downloadImage}
          className="p-2 rounded-full relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Download"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
          <div className="relative rounded-full p-2 group transition duration-200 bg-transparent text-white">
            <Download size={20} />
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default ImageDisplay;
