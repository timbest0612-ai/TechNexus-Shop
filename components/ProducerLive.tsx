
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Song } from '../types';

interface ProducerLiveProps {
  song: Song;
  onClose: () => void;
}

const ProducerLive: React.FC<ProducerLiveProps> = ({ song, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [rms, setRms] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);

  const decodeBase64 = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startSession = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === 'undefined') {
      alert("Professional API Key required for Live Production session.");
      return;
    }

    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              let sum = 0;
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) {
                int16[i] = input[i] * 32768;
                sum += input[i] * input[i];
              }
              setRms(Math.sqrt(sum / input.length));
              
              const binary = '';
              const bytes = new Uint8Array(int16.buffer);
              let b64 = "";
              for (let i = 0; i < bytes.byteLength; i++) b64 += String.fromCharCode(bytes[i]);
              
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: btoa(b64), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const audioBuffer = await decodeAudioData(
                decodeBase64(msg.serverContent.modelTurn.parts[0].inlineData.data),
                outputAudioContextRef.current!
              );
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current!.destination);
              const startTime = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.outputTranscription) {
               setTranscription(prev => [...prev.slice(-4), msg.serverContent!.outputTranscription!.text]);
            }
          },
          onclose: () => setIsActive(false),
          onerror: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the Lead Producer for MuseAI. User is working on "${song.title}", a ${song.style} track. Talk like a cool, supportive professional music producer. Give advice on fidelity, heritage, and energy.`,
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      setIsConnecting(false);
      alert("Failed to connect to Live Studio.");
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 animate-in zoom-in-95 duration-500">
      <div className="max-w-4xl w-full flex flex-col items-center space-y-12">
        <header className="text-center space-y-4">
           <div className="w-24 h-24 bg-primary-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(139,92,246,0.6)] animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
           </div>
           <div className="space-y-1">
             <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Live Producer Session</h2>
             <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.4em]">Real-Time Studio Guidance Active</p>
           </div>
        </header>

        {!isActive ? (
          <div className="text-center space-y-8">
            <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">Initiate a real-time voice interaction with your Lead Producer. Discuss your track arrangement, vocal DNA, and 98% fidelity mastering directly.</p>
            <button 
              disabled={isConnecting}
              onClick={startSession}
              className="px-16 py-8 bg-primary-600 hover:bg-primary-500 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95"
            >
              {isConnecting ? 'CONNECTING...' : 'OPEN STUDIO MIC'}
            </button>
            <button onClick={onClose} className="block w-full text-slate-700 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Return to Project</button>
          </div>
        ) : (
          <div className="w-full space-y-10">
             <div className="flex items-center justify-center space-x-2 h-40">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 bg-primary-500 rounded-full transition-all duration-75"
                    style={{ height: `${10 + (rms * 200 * (0.5 + Math.random()))}%` }}
                  />
                ))}
             </div>
             
             <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10 min-h-[120px] text-center italic text-slate-300 font-serif text-lg leading-relaxed">
                {transcription.length > 0 ? transcription[transcription.length-1] : "The Producer is listening..."}
             </div>

             <button onClick={onClose} className="mx-auto block px-12 py-5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">End Session</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducerLive;
