
import React from 'react';

const Waveform: React.FC<{ isPlaying?: boolean }> = ({ isPlaying = false }) => {
  // Balanced decorative bars
  const bars = Array.from({ length: 60 }).map((_, i) => ({
    height: Math.random() * 80 + 20,
    delay: Math.random() * 2
  }));

  return (
    <div className="flex items-center justify-center h-full space-x-[2px] w-full px-10">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`w-1 bg-primary-500/30 rounded-full transition-all duration-300 ${isPlaying ? 'animate-[pulse_1.5s_infinite]' : ''}`}
          style={{ 
            height: isPlaying ? `${bar.height}%` : '10%',
            animationDelay: `${bar.delay}s`,
            opacity: 0.1 + (i / 60) * 0.8
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;
