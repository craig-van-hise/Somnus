import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { audioController } from './engine/GenerativeAudioController';
import { PlayButton } from './components/PlayButton';

import { Sliders } from './components/Sliders';
import { SettingsModal } from './components/SettingsModal';
import { AudioSuspendedOverlay } from './components/AudioSuspendedOverlay';

const AppContent = () => {
  const { sessionStatus } = useApp();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white flex flex-col justify-between items-center p-6 relative select-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-950">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="z-10 flex flex-col items-center pt-8 space-y-2 text-center">
        <h1 className="font-serif italic text-5xl font-light tracking-wide text-slate-100 drop-shadow-md">
          Somnus
        </h1>
        <p className="font-sans text-[11px] tracking-[0.35em] text-cyan-200/60 uppercase font-medium">
          Generative Sleep Engine
        </p>
      </header>

      {/* Main Control Panel & Play Button */}
      <main className="z-10 flex flex-col items-center justify-center space-y-10 w-full max-w-sm">
        <PlayButton />
        <Sliders />
      </main>

      {/* Footer Info */}
      <footer className="z-10 pb-4 text-center font-mono text-[10px] tracking-widest text-slate-500 uppercase">
        <span>Sympatho-Respiratory Coupling Engine • V1.0</span>
      </footer>

      {/* Overlays & Modals */}
      <SettingsModal />
      <AudioSuspendedOverlay />
    </div>
  );
};

export function App({ customPreloadPromise = null, onParamUpdate = null }) {
  const handleParamUpdate = (payload) => {
    if (audioController && typeof audioController.updatePayload === 'function') {
      audioController.updatePayload(payload);
    }
    if (audioController && typeof audioController.applyMixerState === 'function') {
      if (payload?.mixerState) {
        audioController.applyMixerState(payload.mixerState);
      }
    }
    if (onParamUpdate) {
      onParamUpdate(payload);
    }
  };

  return (
    <AppProvider customPreloadPromise={customPreloadPromise} onParamUpdate={handleParamUpdate}>
      <AppContent />
    </AppProvider>
  );
}


export default App;
