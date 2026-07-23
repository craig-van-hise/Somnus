import React from 'react';
import * as Tone from 'tone';
import { useApp } from '../context/AppContext';
import { audioController } from '../engine/GenerativeAudioController';

export const PlayButton = () => {
  const { isLoading, sessionStatus, setSessionStatus, setAudioSuspended } = useApp();

  const handlePlayPauseClick = async () => {
    if (isLoading) return;
    setAudioSuspended(false);

    // Explicit Audio Initialization directive:
    // Primary Play button handler MUST synchronously resume native AudioContext and call await Tone.start()
    try {
      const ctx = Tone.getContext ? Tone.getContext() : Tone.context;
      const rawCtx = ctx ? (ctx.rawContext || ctx._context || ctx) : null;
      const nativeCtx = rawCtx ? (rawCtx._nativeAudioContext || rawCtx._nativeContext || rawCtx._context || rawCtx) : null;
      const targetCtx = nativeCtx || rawCtx || ctx;

      if (targetCtx && typeof targetCtx.resume === 'function') {
        await targetCtx.resume();
      }
      if (Tone && typeof Tone.start === 'function') {
        await Tone.start();
      }
    } catch (e) {
      console.warn('Tone.start() warning:', e);
    }

    if (sessionStatus === 'active') {
      // Pause active session
      audioController.pauseSession();
      setSessionStatus('paused');
    } else {
      // Start or resume session (explicitly await boot and start sequence)
      await audioController.startSession();
      setSessionStatus('active');

      const ctx = Tone.getContext ? Tone.getContext() : Tone.context;
      if (ctx && ctx.state === 'suspended') {
        setAudioSuspended(true);
      }
    }
  };

  const handleResetClick = () => {
    if (isLoading || sessionStatus === 'standby') return;
    audioController.resetSession();
    setSessionStatus('standby');
  };

  let buttonText = 'INITIALIZING...';
  if (!isLoading) {
    if (sessionStatus === 'active') {
      buttonText = 'SESSION ACTIVE';
    } else if (sessionStatus === 'paused') {
      buttonText = 'SESSION PAUSED';
    } else {
      buttonText = 'START ENGINE';
    }
  }

  const isResetDisabled = isLoading || sessionStatus === 'standby';

  return (
    <div className="flex items-center space-x-3">
      {/* Primary Play / Pause Button */}
      <button
        type="button"
        data-testid="play-button"
        disabled={isLoading}
        onClick={handlePlayPauseClick}
        className={`relative group px-8 py-5 rounded-full font-sans tracking-widest text-xs font-semibold transition-all duration-300 shadow-xl ${
          isLoading
            ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed animate-pulse'
            : sessionStatus === 'active'
            ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 shadow-emerald-500/20 hover:bg-emerald-500/30 active:scale-95'
            : sessionStatus === 'paused'
            ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200 shadow-amber-500/20 hover:bg-amber-500/30 active:scale-95'
            : 'bg-white/15 border border-white/30 text-white hover:bg-white/25 shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95'
        }`}
      >
        <div className="flex items-center space-x-3">
          <span className="relative flex h-3 w-3">
            {sessionStatus === 'active' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isLoading
                  ? 'bg-amber-400'
                  : sessionStatus === 'active'
                  ? 'bg-emerald-400'
                  : sessionStatus === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
            ></span>
          </span>
          <span>{buttonText}</span>
        </div>
      </button>

      {/* Reset Session Button directly to the right */}
      <button
        type="button"
        data-testid="reset-button"
        disabled={isResetDisabled}
        onClick={handleResetClick}
        title="Reset Session"
        className={`p-4 rounded-full border transition-all duration-300 shadow-lg ${
          isResetDisabled
            ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
            : 'bg-white/10 border-white/20 text-slate-300 hover:text-white hover:bg-white/20 hover:border-white/40 active:scale-95'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};
