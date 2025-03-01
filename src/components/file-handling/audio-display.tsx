import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import FancyText from '@carefully-coded/react-text-gradient';

interface AudioDisplayProps {
  fileUrl: string;
}

const AudioDisplay: React.FC<AudioDisplayProps> = ({ fileUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    // Events
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));
    
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);
  
  // Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Skip forward/backward
  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };
  
  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white/95 dark:bg-neutral-800/95 backdrop-filter backdrop-blur-sm p-8 rounded-lg shadow-xl">
      <audio ref={audioRef} src={fileUrl} preload="metadata" />
      
      
      {/* Waveform visualization */}
      <div className="w-full max-w-2xl h-24 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(90deg, rgba(246,177,68,0.3) 0%, rgba(246,177,68,0.3) ${(currentTime / duration) * 100}%, transparent ${(currentTime / duration) * 100}%, transparent 100%)`
          }}
        >
          {/* Decorative waveform bars */}
          <div className="flex items-end justify-center w-full h-full px-4">
            {[...Array(50)].map((_, i) => {
              // Create a more random, natural waveform
              const randomHeight = 20 + Math.random() * 60;
              return (
                <motion.div 
                  key={i}
                  className="w-1 mx-0.5"
                  style={{
                    height: `${randomHeight}%`,
                    background: i / 50 < currentTime / duration 
                      ? 'linear-gradient(to top, #FE7EF4, #F6B144)' 
                      : '#CBD5E1',
                    opacity: i / 50 < currentTime / duration ? 1 : 0.5
                  }}
                  initial={false}
                  animate={{
                    height: [`${randomHeight}%`, `${randomHeight + (Math.random() * 10 - 5)}%`],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Time display */}
      <div className="w-full max-w-2xl flex justify-between text-gray-600 dark:text-gray-300 mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-6 relative">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => {
            const time = parseFloat(e.target.value);
            setCurrentTime(time);
            if (audioRef.current) audioRef.current.currentTime = time;
          }}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-6">
        <motion.button 
          onClick={() => skipTime(-10)} 
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <SkipBack size={24} />
        </motion.button>
        
        <motion.button 
          onClick={togglePlay} 
          className="p-4 rounded-full relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
          <div className="relative rounded-full p-4 group transition duration-200 bg-transparent text-white">
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </div>
        </motion.button>
        
        <motion.button 
          onClick={() => skipTime(10)} 
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <SkipForward size={24} />
        </motion.button>
      </div>
      
      {/* Volume control */}
      <div className="flex items-center mt-6 space-x-2">
        <motion.button 
          onClick={toggleMute} 
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </motion.button>
        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full"
            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="absolute w-24 h-1.5 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default AudioDisplay;
