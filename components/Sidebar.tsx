
import React, { useState } from 'react';
import { Song, UserAccount, UserTier } from '../types';

interface SidebarProps {
  activeTab: 'create' | 'library' | 'explore' | 'feed';
  onTabChange: (tab: 'create' | 'library' | 'explore' | 'feed') => void;
  account: UserAccount;
  currentSong?: Song | null;
  onOpenTutorial?: () => void;
  onUpdateTier: (tier: UserTier) => void;
}

const TIERS: { id: UserTier; price: string; features: string[]; highlight?: boolean }[] = [
  { id: 'Free', price: '$0', features: ['5 Monthly Credits', 'Standard Quality', 'Personal Use Only'] },
  { id: 'Pro', price: '$15', features: ['100 Monthly Credits', '24-bit HD Master', 'Commercial License', 'Stem Export'], highlight: true },
  { id: 'Studio', price: '$49', features: ['1000 Monthly Credits', '4K Video Synthesis', 'Priority Engine', 'Dedicated Voice DNA'], highlight: false }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, account, currentSong, onOpenTutorial, onUpdateTier }) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<UserTier | null>(null);

  const handleCheckout = (tier: UserTier) => {
    if (tier === account.tier) return;
    setIsCheckingOut(tier);
    setTimeout(() => {
      onUpdateTier(tier);
      setIsCheckingOut(null);
      alert(`Successfully upgraded to ${tier} Plan!`);
    }, 2000);
  };

  return (
    <aside className="w-72 border-r border-border hidden lg:flex flex-col bg-surface/50 backdrop-blur-md p-8 space-y-10 relative">
      {showPlanModal && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="max-w-4xl w-full bg-surface border border-white/10 rounded-[3rem] p-12 space-y-12 shadow-2xl relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowPlanModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="space-y-4 text-center">
                 <h3 className="text-5xl font-black italic uppercase tracking-tighter">Choose Your Lab</h3>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Select a plan to unlock full 98% fidelity production</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TIERS.map((t) => (
                  <div key={t.id} className={`p-10 rounded-[2.5rem] border transition-all flex flex-col justify-between ${account.tier === t.id ? 'bg-primary-500/10 border-primary-500' : t.highlight ? 'bg-white/5 border-primary-500/30 ring-1 ring-primary-500/20 shadow-2xl shadow-primary-500/10' : 'bg-black/40 border-white/5'}`}>
                    <div className="space-y-8">
                       <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-primary-500 tracking-[0.2em]">{t.id} Tier</span>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-black italic">{t.price}</span>
                            <span className="text-slate-600 text-xs font-bold">/MO</span>
                          </div>
                       </div>
                       <ul className="space-y-4">
                          {t.features.map(f => (
                            <li key={f} className="flex items-center space-x-3 text-[11px] font-bold text-slate-400">
                               <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                               <span>{f}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
                    <button 
                      onClick={() => handleCheckout(t.id)} 
                      disabled={isCheckingOut !== null || account.tier === t.id}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all mt-10 ${account.tier === t.id ? 'bg-emerald-500 text-white cursor-default' : isCheckingOut === t.id ? 'bg-slate-800 text-white animate-pulse' : 'bg-white text-black hover:scale-105 active:scale-95 shadow-xl'}`}
                    >
                      {account.tier === t.id ? 'CURRENT PLAN' : isCheckingOut === t.id ? 'PROCESSING...' : `UPGRADE TO ${t.id}`}
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest">Secure Payment Powered by Stripe Simulation</p>
           </div>
        </div>
      )}

      <div className="flex items-center space-x-4 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl shadow-2xl shadow-primary-500/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
        </div>
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter leading-none">MUSEAI</h1>
          <span className="text-[10px] font-bold text-primary-500 tracking-[0.2em] uppercase">98% Studio Fidelity</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col space-y-2">
        <button onClick={() => onTabChange('create')} className={`group w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'create' ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-white/5 text-slate-400'}`}><svg className={`w-5 h-5 transition-colors ${activeTab === 'create' ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg><span className="font-bold uppercase text-xs tracking-widest">Create Track</span></button>
        <button onClick={() => onTabChange('feed')} className={`group w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'feed' ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-white/5 text-slate-400'}`}><svg className={`w-5 h-5 transition-colors ${activeTab === 'feed' ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg><span className="font-bold uppercase text-xs tracking-widest">Global Charts</span></button>
        <button onClick={() => onTabChange('explore')} className={`group w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'explore' ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-white/5 text-slate-400'}`}><svg className={`w-5 h-5 transition-colors ${activeTab === 'explore' ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><span className="font-bold uppercase text-xs tracking-widest">Explore DNA</span></button>
        <button onClick={() => onTabChange('library')} className={`group w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'library' ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-white/5 text-slate-400'}`}><svg className={`w-5 h-5 transition-colors ${activeTab === 'library' ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg><span className="font-bold uppercase text-xs tracking-widest">My Library</span></button>
        
        <button onClick={onOpenTutorial} className="group w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all hover:bg-primary-500/10 text-primary-400 border border-primary-500/10">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="font-bold uppercase text-xs tracking-widest">Mastery Guide</span>
        </button>
      </nav>

      <div className="space-y-6 pt-8 border-t border-border/50">
        <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 space-y-4 border border-white/5 shadow-2xl relative">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-white leading-tight">{account.tier} Tier <br/><span className="text-[10px] text-slate-400 font-normal tracking-normal">{account.isCommercial ? 'Commercial Rights Active' : 'Personal Use Only'}</span></p>
            <div className={`w-2 h-2 rounded-full ${account.isCommercial ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
              <span>Credits</span>
              <span>{account.credits} Left</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (account.credits / (TIERS.find(t => t.id === account.tier)?.price === '$0' ? 5 : 100)) * 100)}%` }} />
            </div>
          </div>
          <button onClick={() => setShowPlanModal(true)} className="w-full py-3 bg-white text-black hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Manage Plan</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
