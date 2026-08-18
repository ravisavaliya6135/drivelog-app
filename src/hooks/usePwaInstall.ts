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

declare global {
  interface Window {
    __drivelogPwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__drivelogPwaDeferredPrompt) {
      return window.__drivelogPwaDeferredPrompt;
    }
    return null;
  });

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

    // Check user agent & touch capabilities
    const ua = window.navigator.userAgent || '';
    const isIosDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isAndroidDevice = /Android/i.test(ua);
    const isMobileDevice =
      isIosDevice ||
      isAndroidDevice ||
      (window.matchMedia('(pointer: coarse)').matches && /Mobile|Tablet|Android|iPhone/i.test(ua));

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsMobile(isMobileDevice);

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('drivelog_pwa_dismissed') === 'true';

    // If pre-captured prompt already exists, set it and trigger timer
    if (window.__drivelogPwaDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(window.__drivelogPwaDeferredPrompt);
      if (!isDismissed && !standalone && isMobileDevice) {
        setTimeout(() => {
          if (!sessionStorage.getItem('drivelog_pwa_dismissed')) {
            setShowPrompt(true);
          }
        }, 3000);
      }
    }

    // For Android/Chromium: Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__drivelogPwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);

      // Delay prompt slightly (3s) so user has interacted with the app first
      if (!sessionStorage.getItem('drivelog_pwa_dismissed') && !standalone && isMobileDevice) {
        setTimeout(() => {
          if (!sessionStorage.getItem('drivelog_pwa_dismissed')) {
            setShowPrompt(true);
          }
        }, 3000);
      }
    };

    // Custom event dispatched from early index.html script
    const handleEarlyPromptAvailable = () => {
      if (window.__drivelogPwaDeferredPrompt) {
        setDeferredPrompt(window.__drivelogPwaDeferredPrompt);
        if (!sessionStorage.getItem('drivelog_pwa_dismissed') && !standalone && isMobileDevice) {
          setTimeout(() => {
            if (!sessionStorage.getItem('drivelog_pwa_dismissed')) {
              setShowPrompt(true);
            }
          }, 3000);
        }
      }
    };

    // For iOS Safari: Show subtle prompt after interaction if not dismissed and not standalone
    if (isIosDevice && !standalone && !isDismissed) {
      const timer = setTimeout(() => {
        if (!sessionStorage.getItem('drivelog_pwa_dismissed')) {
          setShowPrompt(true);
        }
      }, 3500);

      return () => clearTimeout(timer);
    }

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setShowPrompt(false);
      setShowIosInstructions(false);
      setDeferredPrompt(null);
      window.__drivelogPwaDeferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('drivelog-pwa-prompt-available', handleEarlyPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('drivelog-pwa-prompt-available', handleEarlyPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const triggerInstall = useCallback(async () => {
    if (isIOS) {
      setShowPrompt(false);
      setShowIosInstructions(true);
      return;
    }

    const activePrompt = deferredPrompt || window.__drivelogPwaDeferredPrompt;

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
        window.__drivelogPwaDeferredPrompt = null;
      } catch {
        setShowIosInstructions(true);
      }
    } else {
      setShowIosInstructions(true);
    }
  }, [deferredPrompt, isIOS]);

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
