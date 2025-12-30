
import React, { useState } from 'react';

interface Step {
  title: string;
  subtitle: string;
  content: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "The Sonic Blueprint",
    subtitle: "PHASE 1: ARCHITECTURE",
    content: "Start in the Production Hub. Type your sonic vision into the prompt engine. Specify genre, mood, and instruments. Use the Structure tab to drag and drop song parts like Verse and Chorus.",
    icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  },
  {
    title: "Vocal DNA Engineering",
    subtitle: "PHASE 2: TALENT SYNTHESIS",
    content: "Navigate to the Voice tab. Define the 'Cultural DNA' of your vocalist. Select Heritage for specific accents and Traits for character. Save your favorite profile as a 'Persistent My Voice'.",
    icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  },
  {
    title: "The Lyric Doctor",
    subtitle: "PHASE 3: MANUSCRIPT REFINEMENT",
    content: "In Project View, open Lyrics. Click any line to activate the AI Studio Doctor. It suggests 4 alternates that maintain rhythm and rhyme based on cultural context.",
    icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  },
  {
    title: "Fidelity Mastering",
    subtitle: "PHASE 4: FINAL GLUE",
    content: "Use the Mixer to apply professional mastering. Switch between Studio (Radio Ready), Lo-fi (Analog), or Stadium (Huge). We target -14 LUFS industry standards.",
    icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
  },
  {
    title: "Live AI Producer",
    subtitle: "PHASE 5: REAL-TIME COLLABORATION",
    content: "Talk to Gemini in real-time. Click 'Talk to Producer' for arrangement advice, mixing tips, or cultural validation. It's like having a Lead Producer in the room.",
    icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
  }
];

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => currentStep < STEPS.length - 1 ? setCurrentStep(s => s + 1) : onClose();
  const back = () => currentStep > 0 && setCurrentStep(s => s - 1);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
      {/* Absolute top exit for safety */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 flex items-center space-x-2 text-slate-500 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/10 z-[1001]"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">Skip & Enter Lab</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="max-w-4xl w-full max-h-[90vh] bg-surface border border-white/10 rounded-[2.5rem] md:rounded-[4rem] flex flex-col overflow-hidden shadow-[0_0_150px_rgba(139,92,246,0.4)]">
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left Header Panel */}
            <div className="p-8 md:p-16 bg-primary-600 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-indigo-900 opacity-50" />
               <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-white backdrop-blur-xl shadow-2xl animate-bounce">
                  {STEPS[currentStep].icon}
               </div>
               <div className="relative z-10">
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-primary-200 mb-2">{STEPS[currentStep].subtitle}</p>
                  <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-white">{STEPS[currentStep].title}</h3>
               </div>
            </div>

            {/* Right Content Panel */}
            <div className="p-8 md:p-16 flex flex-col justify-center space-y-8 md:space-y-12 bg-surface">
              <div className="space-y-6">
                 <div className="flex space-x-2">
                    {STEPS.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-10 md:w-12 bg-primary-500' : 'w-3 bg-white/5'}`} />
                    ))}
                 </div>
                 <p className="text-lg md:text-2xl text-slate-300 font-medium leading-relaxed italic">
                   {STEPS[currentStep].content}
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* FIXED FOOTER NAVIGATION - Guaranteed visibility */}
        <div className="p-6 md:p-10 bg-black/40 border-t border-white/5 flex items-center justify-between">
           <button 
             onClick={back} 
             disabled={currentStep === 0} 
             className={`px-6 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
           >
             Previous Phase
           </button>
           
           <button 
             onClick={next} 
             className="px-10 md:px-14 py-4 md:py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] text-[10px] md:text-xs"
           >
             {currentStep === STEPS.length - 1 ? 'Finish & Launch Studio' : 'Next Phase'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
