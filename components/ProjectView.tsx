
import React, { useState, useEffect } from 'react';
import { Song, VoiceProfile } from '../types';
import { 
  downloadAsWav, 
  generateVocalPreview,
  suggestLineRemix,
  rateTrack,
  auditVocalStress,
  generateTrackVideo
} from '../services/musicEngine';
import ProducerLive from './ProducerLive';

interface ProjectViewProps {
  song: Song;
  onUpdateSong: (song: Song) => void;
  onRemix: () => void;
  onClose: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ song, onUpdateSong, onRemix, onClose }) => {
  const [activePanel, setActivePanel] = useState<'visuals' | 'mixer' | 'lyrics' | 'analytics' | 'history'>('lyrics');
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [showLiveProducer, setShowLiveProducer] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  
  const [selectedLine, setSelectedLine] = useState<{ text: string, index: number } | null>(null);
  const [lineSuggestions, setLineSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  useEffect(() => {
    if (activePanel === 'analytics' && !scores) {
      rateTrack(song).then(setScores);
    }
  }, [activePanel, song, scores]);

  const handleAuditStress = async () => {
    setIsAuditing(true);
    try {
      const auditedLyrics = await auditVocalStress(song.lyrics, song.style, song.metadata.intensity);
      onUpdateSong({ ...song, lyrics: auditedLyrics });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsRegenerating('video');
    setVideoStatus("Connecting to Veo Studio...");
    try {
      const videoUrl = await generateTrackVideo(song, (status) => setVideoStatus(status));
      onUpdateSong({ ...song, videoUrl });
      setVideoStatus("");
    } catch (e: any) {
      alert("Video generation encountered an error: " + e.message);
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleLineClick = async (line: string, index: number) => {
    if (!line.trim() || line.startsWith('[')) return;
    setSelectedLine({ text: line, index });
    setIsFetchingSuggestions(true);
    const voice: VoiceProfile = song.vocalPlan.voiceDNA ? JSON.parse(song.vocalPlan.voiceDNA) : { heritage: 'Global' };
    try {
      const results = await suggestLineRemix(line, song.style, song.lyrics.slice(0, 300), voice.heritage);
      setLineSuggestions(results);
    } catch (e) {} finally { setIsFetchingSuggestions(false); }
  };

  const applyRemixLine = (newLine: string) => {
    if (!selectedLine) return;
    const lines = song.lyrics.split('\n');
    lines[selectedLine.index] = newLine;
    onUpdateSong({ ...song, lyrics: lines.join('\n') });
    setSelectedLine(null);
  };

  const handleMastering = async (preset: string) => {
    setIsRegenerating('audio');
    const voice: VoiceProfile = song.vocalPlan.voiceDNA ? JSON.parse(song.vocalPlan.voiceDNA) : undefined;
    try {
      const audio = await generateVocalPreview(song.lyrics, song.vocalPlan.tone, song.style, preset, voice, song.metadata.intensity, song.metadata.language);
      onUpdateSong({ ...song, audioUrl: audio, metadata: { ...song.metadata, masteringPreset: preset as any } });
    } catch (e) {} finally { setIsRegenerating(null); }
  };

  const renderLyricsWithStress = (text: string) => {
    return text.split(' ').map((word, i) => {
      if (word.startsWith('^')) {
        return <span key={i} className="text-primary-400 font-black border-b border-primary-500/30 mr-1 animate-pulse">{word.substring(1)}</span>;
      }
      if (word.startsWith('_')) {
        return <span key={i} className="text-emerald-400 font-bold italic mr-1 border-b border-emerald-500/30">{word.substring(1)}</span>;
      }
      return <span key={i} className="mr-1">{word}</span>;
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700 pb-40">
      {showLiveProducer && <ProducerLive song={song} onClose={() => setShowLiveProducer(false)} />}
      
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10 bg-surface border border-primary-500/20 rounded-[4rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 z-10">
           <div className="w-52 h-52 flex-shrink-0 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 relative">
             <img src={song.coverArtUrl || `https://picsum.photos/seed/${song.id}/1024/1024`} className="w-full h-full object-cover" alt="Cover" />
           </div>
           <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-5 py-2 rounded-full border border-emerald-500/20 uppercase tracking-[0.3em]">Stress Mapping Active</span>
                <span className="bg-primary-500/10 text-primary-400 text-[10px] font-black px-5 py-2 rounded-full border border-primary-500/20 uppercase tracking-[0.3em]">High-Sensory Imagery</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">{song.title}</h2>
           </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => downloadAsWav(song, '_Master')} className="px-12 py-8 bg-white text-black font-black rounded-[2.5rem] flex items-center justify-center space-x-4 hover:scale-105 active:scale-95 transition-all shadow-2xl">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="block uppercase text-sm tracking-widest">MASTER WAV</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <div className="flex bg-black/40 border border-white/5 p-2 rounded-[2rem] w-fit overflow-x-auto no-scrollbar">
              {['lyrics', 'mixer', 'visuals', 'analytics', 'history'].map(p => (
                <button key={p} onClick={() => setActivePanel(p as any)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activePanel === p ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:text-white'}`}>{p}</button>
              ))}
           </div>

           {activePanel === 'lyrics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-surface border border-border rounded-[4rem] p-12 shadow-2xl h-[700px] overflow-y-auto custom-scrollbar relative">
                  <div className="absolute top-8 right-8 z-10 flex space-x-2">
                    <button 
                      onClick={handleAuditStress} 
                      disabled={isAuditing}
                      className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      {isAuditing ? 'Auditing Stress...' : 'Audit Rhythmic Stress'}
                    </button>
                    <button onClick={() => setShowLiveProducer(true)} className="text-[9px] font-black uppercase tracking-widest bg-primary-500/20 text-primary-400 px-4 py-2 rounded-xl border border-primary-500/30">Talk to Producer</button>
                  </div>
                  <div className="space-y-1">
                    {song.lyrics.split('\n').map((line, i) => (
                      <p key={i} onClick={() => handleLineClick(line, i)} className={`text-2xl leading-relaxed font-serif italic cursor-pointer transition-all ${line.startsWith('[') ? 'text-primary-500/50 font-black not-italic text-[11px] uppercase pt-10 pb-4 tracking-[0.4em]' : 'text-slate-200 hover:text-primary-400'}`}>
                        {renderLyricsWithStress(line || '') || <br/>}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {selectedLine ? (
                    <div className="bg-primary-500/5 border border-primary-500/20 rounded-[4rem] p-12 animate-in slide-in-from-right duration-500 sticky top-10 shadow-2xl">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary-500 mb-6">Imagery Remaster</h4>
                      <p className="text-lg text-slate-400 mb-8 italic">"{selectedLine.text}"</p>
                      {isFetchingSuggestions ? (<div className="space-y-5 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}</div>) : (
                        <div className="space-y-5">
                          {lineSuggestions.map((suggestion, i) => (
                            <button key={i} onClick={() => applyRemixLine(suggestion)} className="w-full p-6 text-left bg-black/60 border border-white/5 rounded-[2rem] text-sm text-slate-200 hover:border-primary-500 transition-all leading-relaxed">
                              {renderLyricsWithStress(suggestion)}
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="mt-8 text-[9px] text-slate-500 uppercase tracking-widest text-center">AI maintains syllable count for perfect rhythmic fit.</p>
                    </div>
                  ) : (
                    <div className="bg-surface/50 border border-border rounded-[4rem] p-16 text-center space-y-8">
                      <div className="space-y-2">
                        <h4 className="text-[12px] font-black text-slate-300 uppercase tracking-[0.4em]">Prosody Dialect Guide</h4>
                        <p className="text-[10px] text-slate-500 italic">How the synthesizer interprets markers</p>
                      </div>
                      <div className="space-y-6 text-left">
                        <div className="flex items-center space-x-4 p-5 bg-primary-500/5 rounded-3xl border border-primary-500/10">
                           <span className="text-primary-400 font-black text-2xl w-8">^</span>
                           <div>
                             <p className="text-[10px] font-black text-white uppercase tracking-widest">Front-Heavy (Punch)</p>
                             <p className="text-[9px] text-slate-500 leading-tight">Increases attack velocity. Best for rhythmic downbeats and explosive metaphors.</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4 p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                           <span className="text-emerald-400 font-black text-2xl w-8">_</span>
                           <div>
                             <p className="text-[10px] font-black text-white uppercase tracking-widest">Back-Heavy (Swell)</p>
                             <p className="text-[9px] text-slate-500 leading-tight">Elongates vowels and adds melodic vibrato. Best for soulful resolution.</p>
                           </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Select a line to trigger Poetic Imagery Remaster</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
           )}

           {activePanel === 'mixer' && (
              <div className="bg-surface border border-border rounded-[4rem] p-16 shadow-2xl space-y-12">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Fidelity Mastering</h3>
                <div className="grid grid-cols-5 gap-8">
                  {['Studio', 'Stadium', 'Vintage', 'Lo-fi', 'Radio'].map(p => (<button key={p} onClick={() => handleMastering(p)} className={`py-8 rounded-[2rem] border-2 text-[11px] font-black uppercase tracking-[0.3em] transition-all ${song.metadata.masteringPreset === p ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}>{isRegenerating === 'audio' && song.metadata.masteringPreset === p ? 'Processing...' : p}</button>))}
                </div>
              </div>
           )}

           {activePanel === 'visuals' && (
             <div className="bg-surface border border-border rounded-[4rem] p-16 shadow-2xl space-y-10 min-h-[600px] flex flex-col items-center justify-center">
                {song.videoUrl ? (
                  <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 bg-black">
                      <video src={song.videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-center space-x-6">
                      <button 
                        onClick={handleGenerateVideo}
                        disabled={isRegenerating === 'video'}
                        className="px-12 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center space-x-3"
                      >
                        {isRegenerating === 'video' ? (
                          <>
                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                             <span>Regenerating Cinematic...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            <span>Not satisfied? Regenerate Video</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-8 max-w-xl">
                    <div className="w-32 h-32 bg-primary-500/10 rounded-[3rem] border border-primary-500/20 flex items-center justify-center mx-auto text-primary-500">
                       <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Veo Cinematic Engine</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">Synthesize a 1080p high-fidelity music video clip grounded in your track's poetic DNA.</p>
                    </div>
                    <button 
                      onClick={handleGenerateVideo}
                      disabled={isRegenerating === 'video'}
                      className="px-16 py-6 bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center space-x-4 mx-auto"
                    >
                      {isRegenerating === 'video' ? (
                        <>
                           <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                           <span className="animate-pulse">{videoStatus || 'Synthesizing...'}</span>
                        </>
                      ) : (
                        <>
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                           <span>Generate Cinematic Visuals</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Requires Professional Billing API Key</p>
                  </div>
                )}
             </div>
           )}

           {activePanel === 'analytics' && (
             <div className="bg-surface border border-border rounded-[4rem] p-16 shadow-2xl space-y-12">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Studio Analytics</h3>
                {scores ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {Object.entries(scores).map(([label, score]) => (
                      <div key={label} className="p-8 bg-black/40 border border-white/5 rounded-3xl space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                           <span className="text-3xl font-black italic text-primary-500">{score}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
             </div>
           )}
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="bg-surface border border-border rounded-[4rem] p-12 shadow-2xl space-y-12 sticky top-8">
             <h3 className="text-[14px] font-black uppercase tracking-[0.6em] text-primary-500">Project Engine</h3>
             <div className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo</span><span className="text-xl font-black italic text-white">{song.metadata.bpm} BPM</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rhythmic DNA</span><span className="text-[11px] font-black text-emerald-500 uppercase">Synchronized</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Imagery Mode</span><span className="text-[11px] font-black text-primary-500 uppercase">High-Sensory</span></div>
             </div>
             <button onClick={onRemix} className="w-full py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Remix Full Track</button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
