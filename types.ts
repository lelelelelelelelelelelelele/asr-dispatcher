export enum EngineType {
  LOCAL = 'LOCAL',
  CLOUD_GEMINI = 'CLOUD_GEMINI'
}

export interface TranscribeResult {
  text: string;
  confidence?: number;
  engineUsed: EngineType;
  durationMs?: number;
}

export interface ASREngine {
  id: EngineType;
  name: string;
  description: string;
  transcribe(audioBlob: Blob): Promise<TranscribeResult>;
  isAvailable(): boolean;
}

export interface AppConfig {
  activeEngine: EngineType;
  autoDetect: boolean;
}