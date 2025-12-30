
import React, { useState, useEffect, useRef } from 'react';
import { GenerationConfig, Song, VoiceProfile } from '../types';
import { 
  synthesizeFullTrack,
  generateRandomVoice,
  analyzeVoiceDNA
} from '../services/musicEngine';

interface CreateTrackProps {
  onSongGenerated: (song: Song) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  templateSeed?: any;
  creditsRemaining: number;
}

const GENRES = ['Afrobeat', 'Hip-Hop', 'Trap', 'R&B', 'Gospel', 'Amapiano', 'Synthwave', 'Indie Pop', 'Jazz Fusion'];
const LANGUAGES = ['English', 'Vernacular/Slang', 'Native/Local'];
const INTENSITIES = ['Chill', 'Balanced', 'High-Octane'] as const;
const STRUCTURE_PARTS = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro', 'Drop', 'Solo'];
const HERITAGES = ["West African", "East Asian", "Latin American", "Nordic", "Mediterranean", "Southern US", "British Isles", "Caribbean", "Middle Eastern"];
const TRAITS = ["Raspy", "Smooth", "Deep", "High-pitched", "Breathy", "Powerful", "Vibrato", "Auto-tuned", "Soulful", "Gritty"];

const CreateTrack: React.FC<CreateTrackProps> = ({ onSongGenerated, isGenerating, setIsGenerating, templateSeed, creditsRemaining }) => {
  const [activeSubTab, setActiveSubTab] = useState<'concept' | 'lyrics' | 'voice' | 'structure'>('concept');
  const [config, setConfig] = useState<GenerationConfig>({
    prompt: '',
    customLyrics: false,
    lyrics: '',
    genre: 'Afrobeat',
    mood: 'Uplifting',
    vocalType: 'Male Soul',
    masteringPreset: 'Studio',
    intensity: 'Balanced',
    language: 'English',
    structure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Outro'],
    voiceProfile: {
      id: 'default',
      name: 'Studio Standard',
      gender: 'Male',
      heritage: 'West African',
      traits: ['Soulful'],
      accent: 'Standard'
    }
  });

  const [personalVoice, setPersonalVoice] = useState<VoiceProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingRms, setRecordingRms] = useState(0);
  const [showCloningModal, setShowCloningModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('museai_master_voice');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPersonalVoice(parsed);
      // Don't auto-set to personal unless user chooses
    }
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateRms = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          setRecordingRms(sum / dataArray.length / 255);
          animationFrameRef.current = requestAnimationFrame(updateRms);
        }
      };
      updateRms();

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsAnalyzing(true);
        try {
          const profile = await analyzeVoiceDNA(audioBlob);
          const personalProfile = { ...profile, id: 'personal', name: 'My Branded Voice', isPersonal: true };
          localStorage.setItem('museai_master_voice', JSON.stringify(personalProfile));
          setPersonalVoice(personalProfile);
          setConfig(prev => ({ ...prev, voiceProfile: personalProfile }));
          setShowCloningModal(false);
        } catch (e) {
          alert("DNA extraction failed. Try a clearer sample.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access required for voice cloning.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      audioContextRef.current?.close();
    }
  };

  const isLocalMode = !process.env.API_KEY || process.env.API_KEY === 'undefined';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (templateSeed) setConfig(prev => ({ ...prev, ...templateSeed }));
  }, [templateSeed]);

  const handleGenerate = async () => {
    if (creditsRemaining <= 0) {
      setError("Quota exhausted. Upgrade your plan to produce more tracks.");
      return;
    }
    if (!config.prompt && !config.lyrics && !isLocalMode) {
      setError("Concept or Lyrics required to initiate production.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const fullSong = await synthesizeFullTrack(config);
      onSongGenerated(fullSong);
    } catch (err: any) {
      setError("Production engine stalled. Check API connectivity.");
      setIsGenerating(false);
    }
  };

  const updateVoice = (updates: Partial<VoiceProfile>) => {
    setConfig(prev => ({
      ...prev,
      voiceProfile: prev.voiceProfile ? { ...prev.voiceProfile, ...updates } : prev.voiceProfile
    }));
  };

  const addStructurePart = (part: string) => setConfig(prev => ({ ...prev, structure: [...(prev.structure || []), part] }));
  const removeStructurePart = (index: number) => setConfig(prev => ({ ...prev, structure: (prev.structure || []).filter((_, i) => i !== index) }));

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      {showCloningModal && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
          <div className="max-w-xl w-full bg-surface border border-white/10 rounded-[3rem] p-12 text-center space-y-10 shadow-2xl relative overflow-hidden">
             <div className="space-y-4">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">DNA Extraction</h3>
                <p className="text-slate-400 text-sm font-medium">Read any sentence for 10 seconds to clone your natural brand characteristics.</p>
             </div>

             <div className="h-48 flex items-center justify-center space-x-2">
                {isAnalyzing ? (
                  <div className="text-center animate-pulse">
                     <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400">Decoding Vocal Geometry...</p>
                  </div>
                ) : (
                  [...Array(15)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 rounded-full transition-all duration-75 ${isRecording ? 'bg-primary-500' : 'bg-slate-800'}`}
                      style={{ height: isRecording ? `${10 + (recordingRms * 150 * (0.5 + Math.random()))}%` : '10%' }}
                    />
                  ))
                )}
             </div>

             {!isAnalyzing && (
               <div className="space-y-4">
                  <button 
                    onClick={isRecording ? handleStopRecording : handleStartRecording} 
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-primary-600 text-white hover:bg-primary-500'}`}
                  >
                    {isRecording ? 'STOP & ANALYZE' : 'START RECORDING'}
                  </button>
                  <button onClick={() => setShowCloningModal(false)} className="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Cancel Cloning</button>
               </div>
             )}
             
             {/* Decorative grid */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] grid grid-cols-12 gap-1">
                {[...Array(144)].map((_, i) => <div key={i} className="border border-white" />)}
             </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-white">Production Hub</h2>
          <div className="flex items-center space-x-4">
            <p className="text-primary-500 font-bold uppercase tracking-widest text-[10px]">Studio Engine v3.0 Active</p>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{creditsRemaining} Credits Available</p>
          </div>
        </div>
        
        <div className="flex bg-black/40 border border-white/5 p-1.5 rounded-2xl">
          {['concept', 'lyrics', 'voice', 'structure'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {activeSubTab === 'concept' && (
            <section className="bg-surface border border-border rounded-[3rem] p-10 space-y-10 shadow-2xl">
              <textarea
                value={config.prompt}
                onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="What is the sonic vision?..."
                className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-10 min-h-[220px] outline-none text-slate-100 font-medium text-xl leading-relaxed placeholder:text-slate-800"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-widest">Genre Style</label>
                  <select value={config.genre} onChange={(e) => setConfig(p => ({ ...p, genre: e.target.value }))} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-xs font-bold text-slate-200">
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-widest">Energy Intensity</label>
                  <div className="flex bg-black/40 rounded-2xl p-1">
                    {INTENSITIES.map(i => (
                      <button key={i} onClick={() => setConfig(p => ({ ...p, intensity: i as any }))} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${config.intensity === i ? 'bg-primary-500 text-white' : 'text-slate-600'}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-widest">Mastering Dialect</label>
                  <select value={config.language} onChange={(e) => setConfig(p => ({ ...p, language: e.target.value as any }))} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-xs font-bold text-slate-200">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </section>
          )}

          {activeSubTab === 'structure' && (
            <section className="bg-surface border border-border rounded-[3rem] p-10 space-y-10 shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Production Arrangement</h3>
              <div className="flex flex-wrap gap-4 min-h-[120px] p-8 bg-black/40 border border-dashed border-white/10 rounded-[2.5rem] items-center">
                {config.structure?.map((part, i) => (
                  <div key={i} className="group relative bg-primary-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg">
                    {part}
                    <button onClick={() => removeStructurePart(i)} className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                    {i < config.structure!.length - 1 && <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-800">→</div>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {STRUCTURE_PARTS.map(part => (
                  <button key={part} onClick={() => addStructurePart(part)} className="py-4 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-primary-500/50 hover:bg-primary-500/5 transition-all">+ {part}</button>
                ))}
              </div>
            </section>
          )}

          {activeSubTab === 'voice' && (
            <section className="bg-surface border border-border rounded-[3rem] p-10 space-y-10 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Voice Laboratory</h3>
                <div className="flex gap-4">
                  <button onClick={() => setShowCloningModal(true)} className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest border border-emerald-500/20 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <span>Clone My Voice</span>
                  </button>
                  <button onClick={() => setConfig(p => ({ ...p, voiceProfile: generateRandomVoice() }))} className="text-[10px] font-black bg-primary-500/10 text-primary-400 px-6 py-3 rounded-xl hover:bg-primary-500 hover:text-white transition-all uppercase tracking-widest border border-primary-500/20">Synthesize Random Talent</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  {personalVoice && (
                    <div className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between ${config.voiceProfile?.isPersonal ? 'bg-emerald-500/10 border-emerald-500' : 'bg-black/40 border-white/5 hover:border-white/20'}`} onClick={() => setConfig(prev => ({ ...prev, voiceProfile: personalVoice }))}>
                       <div className="flex items-center space-x-6">
                          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Verified Brand Voice</p>
                            <h4 className="text-xl font-black italic uppercase text-white">My DNA Profile</h4>
                          </div>
                       </div>
                       {config.voiceProfile?.isPersonal && <div className="w-4 h-4 bg-emerald-500 rounded-full" />}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500">Global Heritage</label>
                    <select value={config.voiceProfile?.heritage} onChange={(e) => updateVoice({ heritage: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-xs font-bold text-slate-200">
                      {HERITAGES.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500">Gender Identity</label>
                    <div className="flex gap-4">
                      {['Male', 'Female'].map(g => (
                        <button key={g} onClick={() => updateVoice({ gender: g as any })} className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${config.voiceProfile?.gender === g ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] space-y-6">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">DNA Character Traits</span>
                  <div className="flex flex-wrap gap-2">
                    {TRAITS.map(trait => (
                      <button 
                        key={trait} 
                        onClick={() => {
                          const traits = config.voiceProfile?.traits || [];
                          const next = traits.includes(trait) ? traits.filter(t => t !== trait) : [...traits, trait];
                          updateVoice({ traits: next });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${config.voiceProfile?.traits.includes(trait) ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-500'}`}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <div className="p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10">
                       <p className="text-[10px] text-slate-400 italic leading-relaxed">
                         Active Profile: <span className="text-white font-bold">{config.voiceProfile?.heritage} {config.voiceProfile?.gender}</span>
                         <br/>
                         Traits: <span className="text-primary-400 font-bold">{config.voiceProfile?.traits.join(', ')}</span>
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSubTab === 'lyrics' && (
            <section className="bg-surface border border-border rounded-[3rem] p-10 h-[600px] flex flex-col space-y-6 shadow-2xl">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Lyric Manuscript Editor</label>
              <textarea
                value={config.lyrics}
                onChange={(e) => setConfig(p => ({ ...p, lyrics: e.target.value }))}
                className="flex-1 bg-black/20 border border-white/5 rounded-[1.5rem] p-8 outline-none font-mono text-base text-primary-100 leading-relaxed custom-scrollbar resize-none"
                placeholder="Write your lyrics here or let the AI generate them based on your concept..."
              />
            </section>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-surface border border-border rounded-[3rem] p-10 space-y-10 shadow-2xl sticky top-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary-500 border-b border-white/5 pb-4">Studio Master Console</h3>
            <div className="space-y-6">
              <button 
                disabled={isGenerating || creditsRemaining <= 0} 
                onClick={handleGenerate} 
                className={`w-full h-16 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 ${creditsRemaining <= 0 ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20'}`}
              >
                {isGenerating ? 'Synthesizing...' : creditsRemaining <= 0 ? 'Quota Full' : 'Execute Full Production'}
              </button>
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Production Status</span>
                  <span className={creditsRemaining <= 0 ? "text-amber-500" : "text-emerald-500"}>{creditsRemaining <= 0 ? 'Upgrade Required' : 'Ready'}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Usage Fee</span>
                  <span className="text-primary-500">1 Credit</span>
                </div>
              </div>
            </div>
            {error && <div className="text-red-400 text-[10px] text-center font-black uppercase bg-red-400/5 p-4 rounded-2xl border border-red-400/20 animate-bounce">⚠️ {error}</div>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreateTrack;
