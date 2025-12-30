
export enum SongStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export type UserTier = 'Free' | 'Pro' | 'Studio' | 'Enterprise';

export interface UserAccount {
  tier: UserTier;
  credits: number;
  totalGenerated: number;
  renewalDate: number;
  isCommercial: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Random';
  heritage: string;
  traits: string[];
  accent: string;
  isPersonal?: boolean;
}

export interface SongMetadata {
  key: string;
  bpm: number;
  timeSignature: string;
  chordProgression: string;
  instrumentation: string[];
  masteringPreset?: 'Studio' | 'Lo-fi' | 'Stadium' | 'Vintage' | 'Radio';
  intensity: 'Chill' | 'Balanced' | 'High-Octane';
  language: 'English' | 'Vernacular/Slang' | 'Native/Local';
}

export interface SongBlueprint {
  drums: string;
  bass: string;
  melodicLayers: string;
  soundDesign: string;
  atmosphericPads?: string;
  structure: string[];
}

export interface VocalPlan {
  tone: string;
  melodyContour: string;
  harmonyInstructions: string;
  dynamics: string;
  performanceTags?: string[];
  voiceDNA?: string;
}

export interface LyricRevision {
  timestamp: number;
  text: string;
  note: string;
}

export interface Song {
  id: string;
  title: string;
  prompt: string;
  lyrics: string;
  lyricHistory: LyricRevision[];
  style: string;
  metadata: SongMetadata;
  blueprint: SongBlueprint;
  vocalPlan: VocalPlan;
  createdAt: number;
  audioUrl?: string;
  stems?: {
    vocals?: string;
    drums?: string;
    bass?: string;
    melodic?: string;
  };
  coverArtUrl?: string;
  videoUrl?: string;
  status: SongStatus;
  likes?: number;
  plays?: number;
}

export interface GenerationConfig {
  prompt: string;
  lyrics?: string;
  genre?: string;
  mood?: string;
  tempo?: string;
  vocalType?: string;
  customLyrics: boolean;
  imageReference?: string;
  masteringPreset?: string;
  performanceInstruction?: string;
  voiceProfile?: VoiceProfile;
  intensity: 'Chill' | 'Balanced' | 'High-Octane';
  language: 'English' | 'Vernacular/Slang' | 'Native/Local';
  structure: string[];
}
