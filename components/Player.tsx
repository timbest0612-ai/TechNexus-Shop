
import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types';
import { downloadAsWav } from '../services/musicEngine';

interface PlayerProps {
  song: Song;
  onUpdateSong: (song: Song) => void;
  onNavigateToProject?: () => void;
  autoPlay?: boolean;
}

const Player: React.FC<PlayerProps> = ({ song, onUpdateSong, onNavigateToProject, autoPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);
    
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      if (song.audioUrl && song.audioUrl.trim().length > 0) {
        audio.src = song.audioUrl;
        audio.load();
      } else {
        setIsLoading(false);
        setError("Audio stream expired. Please re-generate in project view.");
      }
    }
  }, [song.id, song.audioUrl]);

  useEffect(() => {
    if (autoPlay && audioRef.current && !isLoading && !error) {
      togglePlay();
    }
  }, [autoPlay, isLoading, error]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !song.audioUrl) {
      setError("Source missing. Go to project view and re-synthesize.");
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setError(null);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Audio playback error:", err);
            setIsPlaying(false);
            setIsLoading(false);
            if (err.name === 'NotAllowedError') {
              setError("Playback blocked. Tap to start.");
            } else {
              setError("Playback failed. The audio session might be inactive.");
            }
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      const prog = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
      setProgress(prog);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-3xl border-t border-white/10 p-4 md:p-6 lg:px-12 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={() => {
          setIsLoading(false);
          setError(null);
        }}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          if (song.audioUrl) {
            setError("Source decoding failed. Try re-synthesizing.");
          }
        }}
      />

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        <div onClick={onNavigateToProject} className="flex items-center space-x-4 cursor-pointer group p-2 hover:bg-white/5 rounded-2xl transition-all min-w-0">
          <div className="w-16 h-16 rounded-xl bg-primary-500/20 border border-white/10 overflow-hidden relative flex-shrink-0">
            {song.coverArtUrl ? (
              <img src={song.coverArtUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-primary-500 italic text-xl">M</div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-white truncate text-base leading-tight uppercase italic group-hover:text-primary-400 transition-colors">{song.title}</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{song.style} • {song.metadata.bpm} BPM</p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-8">
            <button className="text-slate-500 hover:text-white transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10 }}>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM2.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 009 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
            </button>
            <button 
              onClick={togglePlay} 
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 ${isLoading ? 'bg-slate-800' : 'bg-white text-black hover:scale-110'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-8 h-8 translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button className="text-slate-500 hover:text-white transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10 }}>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
            </button>
          </div>
          
          <div className="w-full flex items-center space-x-4 px-4">
            <span className="text-[10px] font-mono text-slate-500 w-12 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 relative h-1.5 bg-white/10 rounded-full overflow-hidden group">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                onChange={(e) => {
                  if (audioRef.current) {
                    const seekTime = (Number(e.target.value) / 100) * (audioRef.current.duration || 0);
                    audioRef.current.currentTime = seekTime;
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="h-full bg-primary-500 transition-all duration-100 shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] font-mono text-slate-500 w-12">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-6">
          <button 
            onClick={() => downloadAsWav(song, '_Master')} 
            className="flex flex-col items-center space-y-1 text-slate-500 hover:text-white transition-all group"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Export</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div 
          onClick={() => setError(null)}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-10 py-4 rounded-t-3xl shadow-2xl cursor-pointer hover:bg-red-500 transition-all flex items-center space-x-3"
        >
          <span>⚠️ {error}</span>
          <span className="underline decoration-white/30 text-[8px]">Dismiss</span>
        </div>
      )}
    </div>
  );
};

export default Player;
