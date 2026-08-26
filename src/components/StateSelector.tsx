import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { US_STATES } from '../types';

interface StateSelectorProps {
  value: string;
  onChange: (stateCode: string) => void;
  className?: string;
}

export function StateSelector({ value, onChange, className = '' }: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
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

  const focusOption = (stateCode: string) => optionRefs.current[stateCode]?.focus();

  const handleListboxKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = US_STATES.findIndex((state) => state.code === value);
    const lastIndex = US_STATES.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key === 'ArrowDown') nextIndex = Math.min(currentIndex + 1, lastIndex);
    if (event.key === 'ArrowUp') nextIndex = Math.max(currentIndex - 1, 0);
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;
    if (nextIndex !== null) {
      event.preventDefault();
      focusOption(US_STATES[nextIndex].code);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(event) => {
          if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            setIsOpen(true);
            window.requestAnimationFrame(() => focusOption(value));
          }
        }}
        className="w-full min-h-12 form-input text-left flex items-center justify-between cursor-pointer py-3"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="state-options"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">
              {selectedState.name} ({selectedState.code})
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedState.requiredHours}h total • {selectedState.requiredNightHours}h night required
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="state-options"
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-64 overflow-y-auto animate-fade-in"
          role="listbox"
          aria-label="Select your state"
          onKeyDown={handleListboxKeyDown}
        >
          {US_STATES.map((state) => (
            <button
              key={state.code}
              ref={(element) => { optionRefs.current[state.code] = element; }}
              type="button"
              onClick={() => {
                onChange(state.code);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={value === state.code}
              className={`w-full min-h-12 px-4 py-3 text-left transition-colors flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${
                value === state.code
                  ? 'bg-teal-50/70 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              <div>
                <p className="font-bold text-xs">
                  {state.name} <span className="text-slate-400 font-normal">({state.code})</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {state.requiredHours}h total • {state.requiredNightHours}h night
                </p>
              </div>
              {value === state.code && (
                <Check className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
