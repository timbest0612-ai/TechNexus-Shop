
import React from 'react';
import { Song } from '../types';
import { downloadAsWav } from '../services/musicEngine';

interface LibraryProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onRemix: (song: Song) => void;
  currentSongId?: string;
}

const Library: React.FC<LibraryProps> = ({ songs, onSelectSong, onRemix, currentSongId }) => {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-600">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h3 className="text-xl font-bold">Your library is empty</h3>
        <p className="text-slate-400 max-w-sm">Head over to the Studio to start creating your first AI-powered track.</p>
      </div>
    );
  }

  const handleDownload = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    downloadAsWav(song, '_Master');
  };

  const handleRemixClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    onRemix(song);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight uppercase italic">My Archive</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-500 font-bold uppercase tracking-widest">
          <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{songs.length} Tracks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map(song => (
          <div
            key={song.id}
            onClick={() => onSelectSong(song)}
            className={`group cursor-pointer bg-surface border rounded-[2rem] p-5 transition-all hover:translate-y-[-4px] active:scale-[0.98] ${
              currentSongId === song.id ? 'border-primary-500 ring-1 ring-primary-500 shadow-2xl shadow-primary-500/10' : 'border-border hover:border-white/20'
            }`}
          >
            <div className="relative aspect-square mb-5 bg-gradient-to-br from-primary-500/20 to-indigo-900/40 rounded-2xl flex items-center justify-center overflow-hidden">
              {song.coverArtUrl ? (
                <img src={song.coverArtUrl} alt={song.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 bg-black/40 group-hover:scale-110 transition-transform duration-700" />
              )}
              
              <div className={`w-14 h-14 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center transition-all shadow-2xl z-10 ${
                currentSongId === song.id ? 'scale-110 bg-primary-500 text-white' : 'group-hover:scale-110 border border-white/20 opacity-0 group-hover:opacity-100'
              }`}>
                {currentSongId === song.id ? (
                  <div className="flex items-end space-x-1 h-5">
                    <div className="w-1.5 bg-white animate-[bounce_1s_infinite]" style={{ height: '50%' }} />
                    <div className="w-1.5 bg-white animate-[bounce_1s_infinite_0.2s]" style={{ height: '100%' }} />
                    <div className="w-1.5 bg-white animate-[bounce_1s_infinite_0.4s]" style={{ height: '70%' }} />
                  </div>
                ) : (
                  <svg className="w-8 h-8 translate-x-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>

              <button 
                onClick={(e) => handleRemixClick(e, song)}
                className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-500 z-10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold truncate text-xl leading-tight">{song.title}</h4>
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-primary-400">
                <span className="bg-primary-500/10 px-2 py-0.5 rounded-md border border-primary-500/20">{song.style}</span>
                <span className="text-slate-500">{new Date(song.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{song.metadata.bpm} BPM</span>
              <div className="flex space-x-1">
                <button 
                  onClick={(e) => handleDownload(e, song)} 
                  className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
