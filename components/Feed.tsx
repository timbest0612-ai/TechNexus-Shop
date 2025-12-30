
import React, { useState } from 'react';
import { Song, SongStatus } from '../types';

interface FeedProps {
  onSelectSong: (song: Song) => void;
}

const MOCK_TRENDING: Partial<Song>[] = [
  { id: 'f1', title: 'Neon Shinjuku', style: 'Synthwave', likes: 1240, plays: 45000, coverArtUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80', metadata: { intensity: 'High-Octane', bpm: 128 } as any },
  { id: 'f2', title: 'Savanna Soul', style: 'Afrobeat', likes: 890, plays: 22000, coverArtUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80', metadata: { intensity: 'Balanced', bpm: 110 } as any },
  { id: 'f3', title: 'Marble Echoes', style: 'Indie Pop', likes: 2100, plays: 68000, coverArtUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=400&q=80', metadata: { intensity: 'Chill', bpm: 95 } as any },
  { id: 'f4', title: 'Concrete Jungle', style: 'Trap', likes: 560, plays: 12000, coverArtUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=400&q=80', metadata: { intensity: 'High-Octane', bpm: 140 } as any }
];

const Feed: React.FC<FeedProps> = ({ onSelectSong }) => {
  const [showPortal, setShowPortal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowPortal(false);
      alert("Track submitted for Chart Verification.");
    }, 3000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {showPortal && (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="max-w-xl w-full bg-surface border border-white/10 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Distribution Portal</h3>
              <p className="text-slate-400 text-sm font-medium">This will publish your 24-bit master to the Global Discovery Feed. Charts are updated every 6 hours based on play count and spectral fidelity scores.</p>
              <div className="space-y-4">
                 <button onClick={handleSubmit} disabled={submitting} className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-500 transition-all">
                    {submitting ? 'VALIDATING MASTER...' : 'CONFIRM PUBLICATION'}
                 </button>
                 <button onClick={() => setShowPortal(false)} className="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Cancel Submission</button>
              </div>
           </div>
        </div>
      )}

      <header className="flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Global Charts</h2>
          <p className="text-slate-400 text-sm font-medium">Discover the highest-fidelity tracks from the MuseAI community.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {MOCK_TRENDING.map((song, i) => (
          <div key={song.id} className="group relative bg-surface border border-border rounded-[2.5rem] overflow-hidden hover:border-primary-500/40 transition-all hover:-translate-y-2 shadow-2xl">
            <div className="aspect-square relative">
              <img src={song.coverArtUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={song.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute top-4 left-4"><span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">#{i + 1} Global</span></div>
              <button onClick={() => onSelectSong(song as any)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"><div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform"><svg className="w-8 h-8 text-white translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div></button>
            </div>
            <div className="p-6 space-y-4">
               <div><h3 className="text-xl font-black italic uppercase tracking-tighter truncate">{song.title}</h3><p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">{song.style} • {song.metadata?.bpm} BPM</p></div>
               <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center space-x-4"><div className="flex items-center space-x-1.5"><svg className="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg><span className="text-[10px] font-bold text-slate-500">{song.likes}</span></div><div className="flex items-center space-x-1.5"><svg className="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg><span className="text-[10px] font-bold text-slate-500">{(song.plays! / 1000).toFixed(1)}k</span></div></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-gradient-to-br from-primary-600/20 to-indigo-900/40 rounded-[4rem] p-16 flex items-center justify-between border border-primary-500/20 shadow-2xl relative overflow-hidden group">
         <div className="space-y-6 max-w-2xl z-10">
            <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Studio Spotlight</h3>
            <p className="text-lg text-slate-300 leading-relaxed font-medium">Think your track has 98% fidelity? Submit your master to the global curation engine.</p>
            <button onClick={() => setShowPortal(true)} className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Submit Master Track</button>
         </div>
      </section>
    </div>
  );
};

export default Feed;
