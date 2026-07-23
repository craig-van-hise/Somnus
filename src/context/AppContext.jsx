import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { preloadAssets } from '../services/assetLoader';

const AppContext = createContext(null);

const getStorageItem = (key, fallback) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = localStorage.getItem(`somnus_${key}`);
    if (item === null || item === undefined) return fallback;
    if (typeof fallback === 'number') {
      const parsed = Number(item);
      return isNaN(parsed) ? fallback : parsed;
    }
    if (typeof fallback === 'object') {
      return JSON.parse(item);
    }
    return item;
  } catch (e) {
    return fallback;
  }
};

export const AppProvider = ({ children, customPreloadPromise = null, onParamUpdate = null }) => {
  const isTestBypass = customPreloadPromise !== null;

  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState('initializing'); // 'initializing' | 'standby' | 'active' | 'paused'
  const [sessionDuration, setSessionDuration] = useState(() => isTestBypass ? 60 : getStorageItem('sessionDuration', 60)); // 30 to 120 minutes
  const [currentState, setCurrentState] = useState(() => isTestBypass ? 0.50 : getStorageItem('currentState', 0.50)); // 0.00 to 1.00
  const [masterFadeTime, setMasterFadeTime] = useState(() => isTestBypass ? 10 : getStorageItem('masterFadeTime', 10));
  
  const [audioSuspended, setAudioSuspended] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [solTarget, setSolTarget] = useState(() => isTestBypass ? 20 : getStorageItem('solTarget', 20));
  const [isSolOverrideActive, setIsSolOverrideActive] = useState(false);

  const [mixerState, setMixerState] = useState(() => isTestBypass ? {
    ch1Volume: -6,
    ch2Volume: -6,
    ch3Volume: -6,
    ch4Volume: -6,
    ch5Volume: -6,
    natureBlend: 0.5,
    lpfOverride: false,
    lpfOverrideFreq: 2000,
  } : getStorageItem('mixerState', {
    ch1Volume: -6,
    ch2Volume: -6,
    ch3Volume: -6,
    ch4Volume: -6,
    ch5Volume: -6,
    natureBlend: 0.5,
    lpfOverride: false,
    lpfOverrideFreq: 2000,
  }));

  useEffect(() => {
    if (isTestBypass) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('somnus_sessionDuration', String(sessionDuration));
        localStorage.setItem('somnus_currentState', String(currentState));
        localStorage.setItem('somnus_solTarget', String(solTarget));
        localStorage.setItem('somnus_masterFadeTime', String(masterFadeTime));
        localStorage.setItem('somnus_mixerState', JSON.stringify(mixerState));
      }
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }, [sessionDuration, currentState, solTarget, masterFadeTime, mixerState, isTestBypass]);

  const updateMixerState = useCallback((updater) => {
    setMixerState((prevMixer) => {
      const nextMixer = typeof updater === 'function' ? updater(prevMixer) : { ...prevMixer, ...updater };
      
      setEnginePayload((prevPayload) => {
        const nextPayload = { ...prevPayload, mixerState: nextMixer };
        if (onParamUpdate) {
          onParamUpdate(nextPayload);
        }
        return nextPayload;
      });

      return nextMixer;
    });
  }, [onParamUpdate]);


  // Mathematical parameter payload state (debounced state for audio engine)
  const [enginePayload, setEnginePayload] = useState(() => ({
    sessionDuration: isTestBypass ? 60 : getStorageItem('sessionDuration', 60),
    currentState: isTestBypass ? 0.50 : getStorageItem('currentState', 0.50),
    solTarget: isTestBypass ? 20 : getStorageItem('solTarget', 20),
    masterFadeTime: isTestBypass ? 10 : getStorageItem('masterFadeTime', 10),
    isSolOverrideActive: false,
    mixerState: isTestBypass ? {
      ch1Volume: -6,
      ch2Volume: -6,
      ch3Volume: -6,
      ch4Volume: -6,
      ch5Volume: -6,
      natureBlend: 0.5,
      lpfOverride: false,
      lpfOverrideFreq: 2000,
    } : getStorageItem('mixerState', {
      ch1Volume: -6,
      ch2Volume: -6,
      ch3Volume: -6,
      ch4Volume: -6,
      ch5Volume: -6,
      natureBlend: 0.5,
      lpfOverride: false,
      lpfOverrideFreq: 2000,
    }),
  }));


  // Visual UI counter to verify visual UI renders vs payload updates in tests
  const [visualUpdateCount, setVisualUpdateCount] = useState(0);
  const [payloadUpdateCount, setPayloadUpdateCount] = useState(0);

  const debounceTimerRef = useRef(null);

  // Gatekeeper asset preloading pattern on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setSessionStatus('initializing');

    const loaderPromise = customPreloadPromise
      ? customPreloadPromise
      : preloadAssets();

    loaderPromise
      .then(() => {
        if (isMounted) {
          setIsLoading(false);
          setSessionStatus('standby');
        }
      })
      .catch((err) => {
        console.error('Asset preloading failed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [customPreloadPromise]);

  useEffect(() => {
    if (onParamUpdate) {
      const keys = ['sessionDuration', 'currentState', 'solTarget', 'mixerState'];
      const hasPersisted = keys.some(key => {
        try {
          return localStorage.getItem(`somnus_${key}`) !== null;
        } catch (e) {
          return false;
        }
      });
      if (hasPersisted) {
        onParamUpdate(enginePayload);
      }
    }
  }, []);

  // Update visual state immediately (60fps UI), debounce parameter payload by 100ms
  const updateCurrentState = useCallback((val) => {
    const numericVal = parseFloat(val);
    setCurrentState(numericVal);
    setVisualUpdateCount((prev) => prev + 1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setEnginePayload((prev) => {
        const next = { ...prev, currentState: numericVal };
        if (onParamUpdate) {
          onParamUpdate(next);
        }
        return next;
      });
      setPayloadUpdateCount((prev) => prev + 1);
    }, 100);
  }, [onParamUpdate]);

  const updateSessionDuration = useCallback((val) => {
    const numericVal = parseInt(val, 10);
    setSessionDuration(numericVal);
    setVisualUpdateCount((prev) => prev + 1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setEnginePayload((prev) => {
        const next = { ...prev, sessionDuration: numericVal };
        if (onParamUpdate) {
          onParamUpdate(next);
        }
        return next;
      });
      setPayloadUpdateCount((prev) => prev + 1);
    }, 100);
  }, [onParamUpdate]);

  const updateMasterFadeTime = useCallback((val) => {
    const numericVal = parseInt(val, 10);
    setMasterFadeTime(numericVal);
    setVisualUpdateCount((prev) => prev + 1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setEnginePayload((prev) => {
        const next = { ...prev, masterFadeTime: numericVal };
        if (onParamUpdate) {
          onParamUpdate(next);
        }
        return next;
      });
      setPayloadUpdateCount((prev) => prev + 1);
    }, 100);
  }, [onParamUpdate]);

  const updateSolTarget = useCallback((val, isOverride = true) => {
    const numericVal = parseInt(val, 10);
    setSolTarget(numericVal);
    setIsSolOverrideActive(isOverride);
    setEnginePayload((prev) => ({
      ...prev,
      solTarget: numericVal,
      isSolOverrideActive: isOverride,
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        sessionStatus,
        setSessionStatus,
        sessionDuration,
        currentState,
        masterFadeTime,
        enginePayload,
        visualUpdateCount,
        payloadUpdateCount,
        audioSuspended,
        setAudioSuspended,
        debugMode,
        setDebugMode,
        solTarget,
        setSolTarget,
        isSolOverrideActive,
        setIsSolOverrideActive,
        mixerState,
        setMixerState,
        updateMixerState,
        updateSolTarget,
        updateCurrentState,
        updateSessionDuration,
        updateMasterFadeTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
