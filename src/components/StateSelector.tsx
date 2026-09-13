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
        className="w-full min-h-16 rounded-2xl border-slate-300 bg-white px-4 text-left shadow-sm transition-colors hover:border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-400 dark:focus-visible:ring-teal-400 flex items-center justify-between cursor-pointer py-3"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="state-options"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">
              {selectedState.name} ({selectedState.code})
            </p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              {selectedState.requiredHours}h total • {selectedState.requiredNightHours}h night required
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="state-options"
          className="absolute z-50 mt-2 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900 max-h-72 animate-fade-in"
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
              className={`w-full min-h-12 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 flex items-center justify-between ${
                value === state.code
                  ? 'bg-teal-50/70 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              <div>
                <p className="font-bold text-sm">
                  {state.name} <span className="text-slate-400 font-normal">({state.code})</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
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
