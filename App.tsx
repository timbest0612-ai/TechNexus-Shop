
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, SongStatus, UserAccount, UserTier } from './types';
import Sidebar from './components/Sidebar';
import CreateTrack from './components/CreateTrack';
import Library from './components/Library';
import Player from './components/Player';
import Explore from './components/Explore';
import ProjectView from './components/ProjectView';
import Feed from './components/Feed';
import Tutorial from './components/Tutorial';

const DEFAULT_ACCOUNT: UserAccount = {
  tier: 'Free',
  credits: 5,
  totalGenerated: 0,
  renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
  isCommercial: false
};

const sanitizeSongData = (song: any): Song => {
  if (!song) return {} as Song;
  return {
    id: String(song.id || Math.random().toString(36).substring(7)),
    title: String(song.title || 'Untitled Track'),
    prompt: String(song.prompt || ''),
    lyrics: String(song.lyrics || ''),
    lyricHistory: Array.isArray(song.lyricHistory) ? song.lyricHistory.map((l: any) => ({
      timestamp: Number(l.timestamp || Date.now()),
      text: String(l.text || ''),
      note: String(l.note || '')
    })) : [],
    style: String(song.style || 'Pop'),
    createdAt: Number(song.createdAt || Date.now()),
    status: (song.status in SongStatus) ? song.status : SongStatus.READY,
    audioUrl: typeof song.audioUrl === 'string' ? song.audioUrl : undefined,
    coverArtUrl: typeof song.coverArtUrl === 'string' ? song.coverArtUrl : undefined,
    videoUrl: typeof song.videoUrl === 'string' ? song.videoUrl : undefined,
    likes: Number(song.likes || Math.floor(Math.random() * 500)),
    plays: Number(song.plays || Math.floor(Math.random() * 5000)),
    metadata: {
      key: String(song.metadata?.key || 'C Major'),
      bpm: Number(song.metadata?.bpm || 120),
      timeSignature: String(song.metadata?.timeSignature || '4/4'),
      chordProgression: String(song.metadata?.chordProgression || ''),
      instrumentation: Array.isArray(song.metadata?.instrumentation) ? song.metadata.instrumentation.map((i: any) => String(i)) : [],
      masteringPreset: song.metadata?.masteringPreset || 'Studio',
      intensity: song.metadata?.intensity || 'Balanced',
      language: song.metadata?.language || 'English'
    },
    blueprint: {
      drums: String(song.blueprint?.drums || 'Standard'),
      bass: String(song.blueprint?.bass || 'Standard'),
      melodicLayers: String(song.blueprint?.melodicLayers || 'Standard'),
      soundDesign: String(song.blueprint?.soundDesign || 'Standard'),
      structure: Array.isArray(song.blueprint?.structure) ? song.blueprint.structure.map((s: any) => String(s)) : []
    },
    vocalPlan: {
      tone: String(song.vocalPlan?.tone || 'Neutral'),
      melodyContour: String(song.vocalPlan?.melodyContour || 'Dynamic'),
      harmonyInstructions: String(song.vocalPlan?.harmonyInstructions || 'None'),
      dynamics: String(song.vocalPlan?.dynamics || 'Emotional'),
      voiceDNA: String(song.vocalPlan?.voiceDNA || '')
    }
  };
};

const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'explore' | 'project' | 'feed'>('create');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [templateSeed, setTemplateSeed] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [account, setAccount] = useState<UserAccount>(DEFAULT_ACCOUNT);
  
  const lastGeneratedId = useRef<string | null>(null);
  const steps = ["Architecting Soundscape...", "Researching Cultural DNA...", "Arranging Multi-Tracks...", "Synthesizing Studio Vocals...", "Mastering Final Mix..."];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => setGenerationStep(prev => (prev < steps.length - 1 ? prev + 1 : prev)), 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, steps.length]);

  useEffect(() => {
    const savedSongs = localStorage.getItem('museai_songs');
    const savedAccount = localStorage.getItem('museai_account');
    const firstTime = !localStorage.getItem('museai_onboarded');
    
    if (firstTime) {
      setShowTutorial(true);
    }

    if (savedAccount) {
      try {
        setAccount(JSON.parse(savedAccount));
      } catch (e) {
        setAccount(DEFAULT_ACCOUNT);
      }
    }

    if (savedSongs) {
      try {
        const parsed = JSON.parse(savedSongs);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map(sanitizeSongData).map(s => ({ 
            ...s, 
            audioUrl: (s.audioUrl && s.audioUrl.startsWith('blob:')) ? '' : s.audioUrl 
          }));
          setSongs(cleaned);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('museai_account', JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    if (songs.length > 0) {
      try {
        localStorage.setItem('museai_songs', JSON.stringify(songs));
      } catch (e) {}
    }
  }, [songs]);

  const handleAddSong = (song: Song) => {
    if (account.credits <= 0 && account.tier === 'Free') {
      alert("Out of credits! Please upgrade to continue producing.");
      return;
    }
    const clean = sanitizeSongData(song);
    lastGeneratedId.current = clean.id;
    setSongs(prev => [clean, ...prev]);
    setCurrentSong(clean);
    setIsGenerating(false);
    setActiveTab('project');
    
    // Deduct credits
    setAccount(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits - 1),
      totalGenerated: prev.totalGenerated + 1
    }));
  };

  const handleUpdateSong = useCallback((updated: Song) => {
    const clean = sanitizeSongData(updated);
    setSongs(prev => prev.map(s => s.id === clean.id ? clean : s));
    if (currentSong?.id === clean.id) setCurrentSong(clean);
  }, [currentSong?.id]);

  const handleSelectSong = (song: Song) => {
    lastGeneratedId.current = null;
    const clean = sanitizeSongData(song);
    setCurrentSong(clean);
    setActiveTab('project');
  };

  const handleRemix = (song: Song) => {
    setTemplateSeed({ prompt: song.prompt, genre: song.style, mood: song.vocalPlan.tone, lyrics: song.lyrics });
    setActiveTab('create');
  };

  const handleUpdateTier = (tier: UserTier) => {
    const creditMap: Record<UserTier, number> = {
      'Free': 5,
      'Pro': 100,
      'Studio': 1000,
      'Enterprise': 99999
    };
    setAccount(prev => ({
      ...prev,
      tier,
      credits: creditMap[tier],
      isCommercial: tier !== 'Free'
    }));
  };

  const finishOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('museai_onboarded', 'true');
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    if (!localStorage.getItem('museai_onboarded')) {
      setShowOnboarding(true);
    }
  };

  return (
    <div className="flex h-screen bg-background text-slate-100 overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab === 'project' ? 'library' : activeTab as any} 
        currentSong={currentSong} 
        account={account}
        onTabChange={(tab) => { 
          setActiveTab(tab as any); 
          if (tab === 'create') setTemplateSeed(null); 
        }}
        onOpenTutorial={() => setShowTutorial(true)}
        onUpdateTier={handleUpdateTier}
      />

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/5 z-[150] px-6 py-4 flex justify-between items-center">
        {[
          { id: 'create', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />, label: 'Studio' },
          { id: 'feed', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />, label: 'Charts' },
          { id: 'explore', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />, label: 'DNA' },
          { id: 'library', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />, label: 'Lib' }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id as any)} 
            className={`flex flex-col items-center space-y-1 ${activeTab === item.id ? 'text-primary-500' : 'text-slate-500'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-48 lg:pb-32 relative scroll-smooth">
        {showTutorial && <Tutorial onClose={closeTutorial} />}
        
        {showOnboarding && (
          <div className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
             <div className="max-w-2xl bg-surface border border-primary-500/30 rounded-[3rem] p-12 text-center space-y-8 shadow-[0_0_100px_rgba(139,92,246,0.3)]">
                <div className="w-20 h-20 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                   <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Welcome to Studio Gold</h2>
                  <p className="text-slate-400 leading-relaxed font-medium">You are now equipped with 24-bit spectral synthesis. Experience 98% studio-grade fidelity, cultural heritage validation, and cinematic video grounding.</p>
                </div>
                <button onClick={finishOnboarding} className="px-12 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl">Enter the Lab</button>
             </div>
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-72 h-72 border-[12px] border-primary-500/10 rounded-full" />
              <div className="absolute inset-0 w-72 h-72 border-[12px] border-t-primary-500 rounded-full animate-spin shadow-[0_0_80px_rgba(139,92,246,0.3)]" />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-6xl font-black italic text-primary-500">{Math.round(((generationStep + 1) / steps.length) * 100)}%</span>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">Synthesizing</span>
              </div>
            </div>
            <div className="text-center space-y-3 px-6">
               <p className="text-primary-400 text-2xl font-black uppercase tracking-[0.5em] animate-pulse">{steps[generationStep]}</p>
               <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">Building your custom track mix...</p>
               <button onClick={() => setIsGenerating(false)} className="mt-8 text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors">Abort Production</button>
            </div>
          </div>
        )}
        
        <div className="max-w-[1600px] mx-auto w-full p-6 md:p-10">
          {activeTab === 'create' && (
            <CreateTrack 
              onSongGenerated={handleAddSong} 
              isGenerating={isGenerating} 
              setIsGenerating={setIsGenerating} 
              templateSeed={templateSeed} 
              creditsRemaining={account.credits}
            />
          )}
          {activeTab === 'library' && <Library songs={songs} onSelectSong={handleSelectSong} onRemix={handleRemix} currentSongId={currentSong?.id} />}
          {activeTab === 'explore' && <Explore onUseTemplate={(t) => { setTemplateSeed(t); setActiveTab('create'); }} />}
          {activeTab === 'feed' && <Feed onSelectSong={handleSelectSong} />}
          {activeTab === 'project' && currentSong && <ProjectView song={currentSong} onUpdateSong={handleUpdateSong} onRemix={() => handleRemix(currentSong)} onClose={() => setActiveTab('library')} />}
        </div>
      </main>

      {currentSong && !isGenerating && (
        <Player 
          song={currentSong} 
          onUpdateSong={handleUpdateSong} 
          onNavigateToProject={() => setActiveTab('project')}
          autoPlay={currentSong.id === lastGeneratedId.current}
        />
      )}
    </div>
  );
};

export default App;
