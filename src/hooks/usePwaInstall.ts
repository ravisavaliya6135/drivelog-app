import { useState, useEffect, useCallback } from 'react';

/** iOS Safari exposes navigator.standalone (not part of the standard TS DOM types). */
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

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
    __drivehoursPwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__drivehoursPwaDeferredPrompt) {
      return window.__drivehoursPwaDeferredPrompt;
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
        (window.navigator as NavigatorStandalone).standalone === true ||
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
    const isDismissed = sessionStorage.getItem('drivehours_pwa_dismissed') === 'true';

    // If pre-captured prompt already exists, set it and trigger timer
    if (window.__drivehoursPwaDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(window.__drivehoursPwaDeferredPrompt);
      if (!isDismissed && !standalone && isMobileDevice) {
        setTimeout(() => {
          if (!sessionStorage.getItem('drivehours_pwa_dismissed')) {
            setShowPrompt(true);
          }
        }, 3000);
      }
    }

    // For Android/Chromium: Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__drivehoursPwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);

      // Delay prompt slightly (3s) so user has interacted with the app first
      if (!sessionStorage.getItem('drivehours_pwa_dismissed') && !standalone && isMobileDevice) {
        setTimeout(() => {
          if (!sessionStorage.getItem('drivehours_pwa_dismissed')) {
            setShowPrompt(true);
          }
        }, 3000);
      }
    };

    // Custom event dispatched from early index.html script
    const handleEarlyPromptAvailable = () => {
      if (window.__drivehoursPwaDeferredPrompt) {
        setDeferredPrompt(window.__drivehoursPwaDeferredPrompt);
        if (!sessionStorage.getItem('drivehours_pwa_dismissed') && !standalone && isMobileDevice) {
          setTimeout(() => {
            if (!sessionStorage.getItem('drivehours_pwa_dismissed')) {
              setShowPrompt(true);
            }
          }, 3000);
        }
      }
    };

    // For iOS Safari: Show subtle prompt after interaction if not dismissed and not standalone
    if (isIosDevice && !standalone && !isDismissed) {
      const timer = setTimeout(() => {
        if (!sessionStorage.getItem('drivehours_pwa_dismissed')) {
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
      window.__drivehoursPwaDeferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('drivehours-pwa-prompt-available', handleEarlyPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('drivehours-pwa-prompt-available', handleEarlyPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const triggerInstall = useCallback(async () => {
    if (isIOS) {
      setShowPrompt(false);
      setShowIosInstructions(true);
      return;
    }

    const activePrompt = deferredPrompt || window.__drivehoursPwaDeferredPrompt;

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
        window.__drivehoursPwaDeferredPrompt = null;
      } catch {
        setShowIosInstructions(true);
      }
    } else {
      setShowIosInstructions(true);
    }
  }, [deferredPrompt, isIOS]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    sessionStorage.setItem('drivehours_pwa_dismissed', 'true');
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
