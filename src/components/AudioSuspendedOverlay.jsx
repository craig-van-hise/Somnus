import React from 'react';
import * as Tone from 'tone';
import { useApp } from '../context/AppContext';

export const AudioSuspendedOverlay = () => {
  const { audioSuspended, setAudioSuspended, sessionStatus } = useApp();

  if (!audioSuspended || sessionStatus !== 'active') {
    return null;
  }

  const handleResume = async () => {
    try {
      if (Tone.context && Tone.context.resume) {
        await Tone.context.resume();
      }
    } catch (err) {
      console.error('AudioContext resume failed:', err);
    }
    setAudioSuspended(false);
  };

  return (
    <div
      data-testid="audio-suspended-overlay"
      onClick={handleResume}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-opacity duration-300"
    >
      <div className="bg-white/10 border border-white/20 rounded-3xl p-8 max-w-sm shadow-2xl backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-4 text-amber-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-serif italic text-xl text-white mb-2">Audio Paused</h3>
        <p className="font-sans text-xs tracking-wider text-slate-300 uppercase leading-relaxed">
          Audio engine paused by browser. Tap anywhere to resume.
        </p>
      </div>
    </div>
  );
};
