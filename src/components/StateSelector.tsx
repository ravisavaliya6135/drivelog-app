import { useState } from 'react';
import { MapPin, AlertTriangle, ChevronDown } from 'lucide-react';
import { US_STATES, type StateInfo } from '../types';

interface StateSelectorProps {
  value: string;
  onChange: (stateCode: string) => void;
  className?: string;
  showWarning?: boolean;
}

export function StateSelector({ value, onChange, className = '', showWarning = true }: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedState = US_STATES.find(s => s.code === value) || US_STATES[4]; // Default to CA

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-slate-400" />
          <div>
            <p className="font-medium text-slate-900">{selectedState.name} ({selectedState.code})</p>
            <p className="text-xs text-slate-500">
              {selectedState.requiredHours}h total, {selectedState.requiredNightHours}h night required
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {US_STATES.map(state => (
            <button
              key={state.code}
              type="button"
              onClick={() => { onChange(state.code); setIsOpen(false); }}
              className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                value === state.code ? 'bg-slate-50' : ''
              } ${state.requiresSpecificApp ? 'text-amber-700' : 'text-slate-900'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{state.name} <span className="text-slate-500 font-normal">({state.code})</span></p>
                  <p className="text-xs text-slate-500">
                    {state.requiredHours}h total, {state.requiredNightHours}h night
                  </p>
                </div>
                {value === state.code && (
                  <span className="w-5 h-5 text-slate-600">✓</span>
                )}
              </div>
              {state.requiresSpecificApp && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  May require specific app: {state.appName}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {showWarning && selectedState.requiresSpecificApp && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Heads up:</p>
            <p>{selectedState.name} may require using their official app ({selectedState.appName}) for legal compliance. This log works as a supplement but check your local DMV requirements.</p>
          </div>
        </div>
      )}
    </div>
  );
}