import { useState, useEffect, useCallback } from 'react';

export interface PwaInstallState {
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  canPrompt: boolean;
  showPrompt: boolean;
  showIosInstructions: boolean;
  triggerInstall: () => Promise<void>;
  dismissPrompt: () => void;
  openIosInstructions: () => void;
  closeIosInstructions: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  // Platform detections
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed / launched as PWA)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // Check user agent
    const ua = window.navigator.userAgent || '';
    const isIosDevice = 
      /iPad|iPhone|iPod/.test(ua) || 
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isAndroidDevice = /Android/i.test(ua);
    const isMobileDevice = 
      isIosDevice || 
      isAndroidDevice || 
      (window.matchMedia('(pointer: coarse)').matches && /Mobile|Tablet/i.test(ua));

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsMobile(isMobileDevice);

    // If already installed or on desktop, don't show auto prompt
    if (standalone || !isMobileDevice) return;

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('drivelog_pwa_dismissed') === 'true';
    if (isDismissed) return;

    // For Android/Chromium: Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Delay prompt slightly so user can first interact with the app
      const timer = setTimeout(() => {
        if (!sessionStorage.getItem('drivelog_pwa_dismissed')) {
          setShowPrompt(true);
        }
      }, 3500);

      return () => clearTimeout(timer);
    };

    // For iOS Safari: Show subtle prompt after interaction if not dismissed and not standalone
    if (isIosDevice && !standalone && !isDismissed) {
      const timer = setTimeout(() => {
        if (!sessionStorage.getItem('drivelog_pwa_dismissed')) {
          setShowPrompt(true);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setShowPrompt(false);
      setShowIosInstructions(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (isIOS) {
      setShowPrompt(false);
      setShowIosInstructions(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error triggering PWA install prompt:', err);
      }
    } else if (isAndroid) {
      // If beforeinstallprompt hasn't fired yet or expired, show guide
      setShowIosInstructions(true);
    }
  }, [deferredPrompt, isIOS, isAndroid]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    sessionStorage.setItem('drivelog_pwa_dismissed', 'true');
  }, []);

  const openIosInstructions = useCallback(() => {
    setShowIosInstructions(true);
  }, []);

  const closeIosInstructions = useCallback(() => {
    setShowIosInstructions(false);
  }, []);

  return {
    isInstalled,
    isStandalone,
    isIOS,
    isAndroid,
    isMobile,
    canPrompt: !!deferredPrompt || isIOS,
    showPrompt: showPrompt && isMobile && !isStandalone,
    showIosInstructions,
    triggerInstall,
    dismissPrompt,
    openIosInstructions,
    closeIosInstructions,
  };
}
