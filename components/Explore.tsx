
import React, { useState } from 'react';

interface Template {
  title: string;
  genre: string;
  mood: string;
  prompt: string;
  image: string;
}

const TEMPLATES: Template[] = [
  {
    title: "Lagos Midnight",
    genre: "Afrobeat",
    mood: "Uplifting",
    prompt: "A smooth Amapiano-fused Afrobeat about the energy of Lagos at night, featuring heavy log drums and jazzy sax.",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Cyberpunk Rain",
    genre: "Trap",
    mood: "Cinematic",
    prompt: "Dark, futuristic trap with aggressive synths and melancholic piano melodies.",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Sunday Morning",
    genre: "Gospel",
    mood: "Prayerful",
    prompt: "Soulful contemporary gospel with a powerful choir and Hammond B3 organ.",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Deep Sea Echoes",
    genre: "Lo-fi",
    mood: "Melancholic",
    prompt: "Underwater lo-fi hip hop with vinyl crackle and ethereal vocal whispers.",
    image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=400&q=80"
  }
];

interface ExploreProps {
  onUseTemplate: (template: Template) => void;
}

const Explore: React.FC<ExploreProps> = ({ onUseTemplate }) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setShowApplyModal(false);
      alert("Application received. We will review your 24-bit masters.");
    }, 2500);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {showApplyModal && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="max-w-xl w-full bg-surface border border-white/10 rounded-[3rem] p-12 text-center space-y-8">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Creator Network</h3>
              <p className="text-slate-400 text-sm font-medium">Join the elite network of AI Producers. To qualify, you must have published at least 3 tracks with a fidelity rating of 95% or higher.</p>
              <div className="space-y-4">
                 <button onClick={handleApply} disabled={isApplying} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                    {isApplying ? 'VERIFYING MASTERS...' : 'SUBMIT APPLICATION'}
                 </button>
                 <button onClick={() => setShowApplyModal(false)} className="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Back to Explore</button>
              </div>
           </div>
        </div>
      )}

      <header className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight uppercase italic leading-none">Explore DNA</h2>
        <p className="text-slate-400 text-sm font-medium">Jumpstart your studio sessions with multi-track blueprints.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEMPLATES.map((t, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[2.5rem] bg-surface border border-border hover:border-primary-500/50 transition-all cursor-pointer shadow-xl" onClick={() => onUseTemplate(t)}>
            <div className="aspect-[4/5] relative">
              <img src={t.image} alt={t.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-6 space-y-2"><span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-400">{t.genre}</span><h3 className="text-xl font-black italic uppercase tracking-tighter">{t.title}</h3><p className="text-[10px] text-slate-400 line-clamp-2 italic font-medium leading-relaxed">"{t.prompt}"</p></div>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-primary-500/5 border border-primary-500/10 rounded-[3.5rem] p-16 flex items-center justify-between gap-12 relative overflow-hidden">
        <div className="space-y-6 max-w-xl z-10">
          <div className="space-y-2"><h3 className="text-4xl font-black uppercase italic tracking-tighter">Collaborative Mode</h3><p className="text-slate-400 text-sm leading-relaxed font-medium">Share your track blueprints with the MuseAI community and earn credits for every remix.</p></div>
          <button onClick={() => setShowApplyModal(true)} className="px-10 py-5 bg-white text-black hover:bg-slate-200 font-black rounded-2xl transition-all uppercase text-[11px] tracking-widest shadow-2xl">Join Creator Program</button>
        </div>
      </section>
    </div>
  );
};

export default Explore;
