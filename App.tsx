import React, { useState } from 'react';
import { EngineType, TranscribeResult } from './types';
import { dispatcher } from './services/engineStrategy';
import { AudioRecorder } from './components/AudioRecorder';
import { SettingsPanel } from './components/SettingsPanel';
import { Settings, ExternalLink, Activity, Languages } from 'lucide-react';

const App: React.FC = () => {
  const [activeEngine, setActiveEngine] = useState<EngineType>(EngineType.CLOUD_GEMINI);
  const [result, setResult] = useState<TranscribeResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const transcription = await dispatcher.dispatch(audioBlob, activeEngine);
      setResult(transcription);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during transcription.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Languages className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight">Polyglot ASR</h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              Strategy Pattern Demo
            </span>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            title="Configure Engines"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">
        
        {/* Active Strategy Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 shadow-sm">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Current Strategy: </span>
            <span className="font-semibold text-slate-900">
              {activeEngine === EngineType.CLOUD_GEMINI ? 'Cloud (Gemini)' : 'Local (Native)'}
            </span>
          </div>
        </div>

        {/* Recorder Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <AudioRecorder 
            onRecordingComplete={handleRecordingComplete} 
            isProcessing={isProcessing} 
          />
        </div>

        {/* Results Section */}
        {(result || error) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-medium">Processing Failed</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
                {activeEngine === EngineType.LOCAL && (
                  <button 
                    onClick={() => setActiveEngine(EngineType.CLOUD_GEMINI)}
                    className="mt-4 text-sm font-medium text-red-700 hover:underline"
                  >
                    Switch to Cloud Engine?
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Transcription</h3>
                  <div className="flex gap-2">
                     <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                        {result?.durationMs ? `${Math.round(result.durationMs)}ms` : ''}
                     </span>
                     <button 
                        onClick={() => navigator.clipboard.writeText(result?.text || '')}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                     >
                        Copy <ExternalLink className="w-3 h-3" />
                     </button>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {result?.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsPanel 
        activeEngine={activeEngine}
        onEngineChange={(engine) => {
          setActiveEngine(engine);
          setIsSettingsOpen(false);
        }}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>Powered by Google Gemini 2.5 Flash & React</p>
      </footer>
    </div>
  );
};

export default App;