import { useState, useRef, useEffect } from 'react';
import { MapPin, AlertTriangle, ChevronDown, Check } from 'lucide-react';
import { US_STATES } from '../types';

interface StateSelectorProps {
  value: string;
  onChange: (stateCode: string) => void;
  className?: string;
  showWarning?: boolean;
}

export function StateSelector({ value, onChange, className = '', showWarning = true }: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedState = US_STATES.find(s => s.code === value) || US_STATES[4];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full form-input text-left flex items-center justify-between cursor-pointer py-3"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">
              {selectedState.name} ({selectedState.code})
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedState.requiredHours}h total • {selectedState.requiredNightHours}h night required
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-64 overflow-y-auto animate-fade-in"
          role="listbox"
        >
          {US_STATES.map((state) => (
            <button
              key={state.code}
              type="button"
              onClick={() => {
                onChange(state.code);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={value === state.code}
              className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${
                value === state.code
                  ? 'bg-teal-50/70 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              <div>
                <p className="font-bold text-xs">
                  {state.name} <span className="text-slate-400 font-normal">({state.code})</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {state.requiredHours}h total • {state.requiredNightHours}h night
                </p>
              </div>
              {value === state.code && (
                <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}