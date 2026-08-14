import { useState, useRef, useEffect } from 'react';
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedState = US_STATES.find(s => s.code === value) || US_STATES[4]; // Default to CA

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, US_STATES.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Enter':
      case ' ':
        if (isOpen && focusedIndex >= 0) {
          e.preventDefault();
          onChange(US_STATES[focusedIndex].code);
          setIsOpen(false);
          setFocusedIndex(-1);
        } else if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(US_STATES.length - 1);
        }
        break;
      default:
        // Type-ahead search
        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
          const searchChar = e.key.toLowerCase();
          const startIndex = isOpen ? focusedIndex + 1 : 0;
          for (let i = 0; i < US_STATES.length; i++) {
            const idx = (startIndex + i) % US_STATES.length;
            if (US_STATES[idx].name.toLowerCase().startsWith(searchChar)) {
              setFocusedIndex(idx);
              if (!isOpen) setIsOpen(true);
              break;
            }
          }
        }
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const option = dropdownRef.current?.querySelector(`button[data-index="${focusedIndex}"]`);
      option?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if focus is moving to dropdown options
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        if (!dropdownRef.current?.contains(document.activeElement)) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      }, 100);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="input-field touch-target no-tap-highlight text-left flex items-center justify-between hover:shadow-md transition-smooth"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="state-dropdown"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium text-slate-900">{selectedState.name} ({selectedState.code})</p>
            <p className="text-xs text-muted">
              {selectedState.requiredHours}h total, {selectedState.requiredNightHours}h night required
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted transition-smooth ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="state-dropdown"
          className="absolute z-50 w-full mt-2 glass rounded-2xl shadow-lg max-h-64 overflow-y-auto animate-fade-in"
          role="listbox"
          aria-label="Select state"
        >
          {US_STATES.map((state, index) => (
            <button
              key={state.code}
              type="button"
              data-index={index}
              onClick={() => { onChange(state.code); setIsOpen(false); }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(state.code);
                  setIsOpen(false);
                  setFocusedIndex(-1);
                  buttonRef.current?.focus();
                }
              }}
              role="option"
              aria-selected={value === state.code}
              className={`w-full px-4 py-4 text-left touch-target no-tap-highlight transition-fast relative ${
                value === state.code ? 'bg-indigo-50/50' : 'hover:bg-white/50'
              } ${focusedIndex === index ? 'bg-indigo-100/50 outline-none ring-2 ring-indigo-500 ring-offset-2 ring-offset-white' : ''} ${index === 0 ? 'rounded-t-2xl' : ''} ${index === US_STATES.length - 1 ? 'rounded-b-2xl' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {state.name} <span className="text-muted font-normal">({state.code})</span>
                  </p>
                  <p className="text-xs text-muted">
                    {state.requiredHours}h total, {state.requiredNightHours}h night
                  </p>
                </div>
                {value === state.code && (
                  <span className="badge badge-primary">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    Selected
                  </span>
                )}
              </div>
              {state.requiresSpecificApp && (
                <p className="text-xs mt-1 flex items-center gap-1">
                  <span className="badge badge-warning">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
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