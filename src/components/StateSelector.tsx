import { useState } from 'react';
import { MapPin, AlertTriangle, ChevronDown, Check } from 'lucide-react';
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
        className="input-field touch-target no-tap-highlight text-left flex items-center justify-between hover:shadow-md transition-smooth"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-slate-900">{selectedState.name} ({selectedState.code})</p>
            <p className="text-xs text-slate-500">
              {selectedState.requiredHours}h total, {selectedState.requiredNightHours}h night required
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-smooth ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 glass rounded-2xl shadow-lg max-h-64 overflow-y-auto animate-fade-in">
          {US_STATES.map((state, index) => (
            <button
              key={state.code}
              type="button"
              onClick={() => { onChange(state.code); setIsOpen(false); }}
              className={`w-full px-4 py-3 text-left touch-target no-tap-highlight transition-fast ${
                value === state.code ? 'bg-indigo-50/50' : 'hover:bg-white/50'
              } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === US_STATES.length - 1 ? 'rounded-b-2xl' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {state.name} <span className="text-slate-500 font-normal">({state.code})</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {state.requiredHours}h total, {state.requiredNightHours}h night
                  </p>
                </div>
                {value === state.code && (
                  <span className="badge badge-primary">
                    <Check className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              {state.requiresSpecificApp && (
                <p className="text-xs mt-1 flex items-center gap-1">
                  <span className="badge badge-warning">
                    <AlertTriangle className="w-3 h-3" />
                    {state.appName}
                  </span>
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {showWarning && selectedState.requiresSpecificApp && (
        <div className="mt-3 card-gradient-warning p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Heads up:</p>
              <p className="mt-1">{selectedState.name} may require using their official app ({selectedState.appName}) for legal compliance. This log works as a supplement but check your local DMV requirements.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}