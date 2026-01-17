import React from 'react';
import { EngineType } from '../types';
import { Settings, Cpu, CloudLightning } from 'lucide-react';

interface SettingsPanelProps {
  activeEngine: EngineType;
  onEngineChange: (engine: EngineType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  activeEngine, 
  onEngineChange, 
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Settings className="w-5 h-5 text-indigo-600" />
            Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Active ASR Engine
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => onEngineChange(EngineType.CLOUD_GEMINI)}
                className={`relative flex items-center p-4 border rounded-xl transition-all ${
                  activeEngine === EngineType.CLOUD_GEMINI
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeEngine === EngineType.CLOUD_GEMINI ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <CloudLightning className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <div className="font-semibold text-slate-900">Cloud Engine</div>
                  <div className="text-xs text-slate-500">Gemini 2.5 Flash (Recommended)</div>
                </div>
                {activeEngine === EngineType.CLOUD_GEMINI && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600"></div>
                )}
              </button>

              <button
                onClick={() => onEngineChange(EngineType.LOCAL)}
                className={`relative flex items-center p-4 border rounded-xl transition-all ${
                  activeEngine === EngineType.LOCAL
                    ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeEngine === EngineType.LOCAL ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <div className="font-semibold text-slate-900">Local Engine</div>
                  <div className="text-xs text-slate-500">Browser Native (Offline)</div>
                </div>
                {activeEngine === EngineType.LOCAL && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-600"></div>
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              The Strategy Pattern Dispatcher will route audio processing to the selected engine. 
              Local mode saves cost; Cloud mode offers higher accuracy.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};