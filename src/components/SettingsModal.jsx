import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    debugMode,
    setDebugMode,
    solTarget,
    updateSolTarget,
    isSolOverrideActive,
    setIsSolOverrideActive,
    currentState,
    mixerState,
    updateMixerState,
    masterFadeTime,
    updateMasterFadeTime,
    musicalKey,
    updateMusicalKey,
  } = useApp();


  // Calculated SOL target from Current State formula: 25 - 15 * S
  const calculatedSolTarget = Math.round(25 - 15 * currentState);
  const activeSolTarget = isSolOverrideActive ? solTarget : calculatedSolTarget;

  return (
    <>
      {/* Cog button fixed at top right */}
      <button
        type="button"
        data-testid="settings-cog-button"
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-40 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
        aria-label="Advanced Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          data-testid="settings-modal"
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="min-h-full flex items-start justify-center px-4 py-8">
          <div className="bg-slate-900/90 border border-white/20 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-serif italic text-xl">Advanced Engine Settings</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* QA Debug Mode Toggle */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <label htmlFor="debug-mode-toggle" className="font-sans text-xs tracking-wider uppercase font-semibold text-slate-200 block">
                  QA Debug Mode
                </label>
                <span className="text-[10px] text-slate-400 block">Compress timeline (3m total / 1m SOL)</span>
              </div>
              <input
                id="debug-mode-toggle"
                type="checkbox"
                data-testid="debug-mode-toggle"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
              />
            </div>

            {/* Manual SOL Target Override Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="sol-override-toggle" className="font-sans text-xs tracking-wider uppercase font-semibold text-slate-200 block">
                    Manual SOL Fine-Tuning
                  </label>
                  <span className="text-[10px] text-slate-400 block">
                    {isSolOverrideActive
                      ? `Active manual target: ${activeSolTarget}m`
                      : `Auto calculated target: ${calculatedSolTarget}m`}
                  </span>
                </div>
                <input
                  id="sol-override-toggle"
                  type="checkbox"
                  data-testid="sol-override-toggle"
                  checked={isSolOverrideActive}
                  onChange={(e) => setIsSolOverrideActive(e.target.checked)}
                  className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
                />
              </div>

              {/* SOL Target Fine-Tuning Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans tracking-widest text-slate-200">
                  <span className="uppercase">SOL Target Time</span>
                  <span className="font-mono text-cyan-300 font-bold">{solTarget} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={solTarget}
                  onChange={(e) => updateSolTarget(e.target.value, true)}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5m</span>
                  <span>17m</span>
                  <span>30m</span>
                </div>
              </div>
            </div>

            {/* Master Fade-In Time Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans tracking-widest text-slate-200">
                <span className="uppercase">Master Fade-In Time</span>
                <span className="font-mono text-cyan-300 font-bold">{masterFadeTime} sec</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={masterFadeTime}
                onChange={(e) => updateMasterFadeTime(e.target.value)}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>3s</span>
                <span>16s</span>
                <span>30s</span>
              </div>
            </div>

            {/* Musical Key Selector */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-sans text-xs tracking-wider uppercase font-semibold text-slate-200 block">
                    Harmonic Root Key
                  </label>
                  <span className="text-[10px] text-slate-400 block">Transposes music & entrainment</span>
                </div>
                <select
                  value={musicalKey}
                  onChange={(e) => updateMusicalKey(e.target.value)}
                  className="bg-slate-800 border border-white/20 text-cyan-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 outline-none font-mono"
                >
                  <option value="C">C Major</option>
                  <option value="C#">C# Major</option>
                  <option value="D">D Major</option>
                  <option value="D#">D# Major</option>
                  <option value="E">E Major</option>
                  <option value="F">F Major</option>
                  <option value="F#">F# Major</option>
                  <option value="G">G Major</option>
                  <option value="G#">G# Major</option>
                  <option value="A">A Major</option>
                  <option value="A#">A# Major</option>
                  <option value="B">B Major</option>
                </select>
              </div>
            </div>

            {/* 5-Channel Diagnostic Mixer */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="font-sans text-xs tracking-wider uppercase font-semibold text-slate-200">
                5-Channel Diagnostic Mixer
              </h4>

              {/* Ch 1: Binaural */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Ch 1: Binaural Beats</span>
                  <span>{mixerState?.ch1Volume ?? -6} dB</span>
                </div>
                <input
                  type="range"
                  data-testid="fader-ch1"
                  min="-60"
                  max="0"
                  step="1"
                  value={mixerState?.ch1Volume ?? -6}
                  onChange={(e) => updateMixerState({ ch1Volume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Ch 2: Isochronic */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Ch 2: Isochronic Noise</span>
                  <span>{mixerState?.ch2Volume ?? -6} dB</span>
                </div>
                <input
                  type="range"
                  data-testid="fader-ch2"
                  min="-60"
                  max="0"
                  step="1"
                  value={mixerState?.ch2Volume ?? -6}
                  onChange={(e) => updateMixerState({ ch2Volume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Ch 3: Continuous Noise */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Ch 3: Continuous Masking</span>
                  <span>{mixerState?.ch3Volume ?? -6} dB</span>
                </div>
                <input
                  type="range"
                  data-testid="fader-ch3"
                  min="-60"
                  max="0"
                  step="1"
                  value={mixerState?.ch3Volume ?? -6}
                  onChange={(e) => updateMixerState({ ch3Volume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Ch 4: Nature Ambience */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Ch 4: Nature Ambience</span>
                  <span>{mixerState?.ch4Volume ?? -6} dB</span>
                </div>
                <input
                  type="range"
                  data-testid="fader-ch4"
                  min="-60"
                  max="0"
                  step="1"
                  value={mixerState?.ch4Volume ?? -6}
                  onChange={(e) => updateMixerState({ ch4Volume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Nature Submixer Blend (Rain -> Waves) */}
              <div className="space-y-1 pl-2 border-l border-white/10">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Nature Blend (Rain ➔ Waves)</span>
                  <span>{Math.round((mixerState?.natureBlend ?? 0.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  data-testid="fader-nature-blend"
                  min="0"
                  max="1"
                  step="0.05"
                  value={mixerState?.natureBlend ?? 0.5}
                  onChange={(e) => updateMixerState({ natureBlend: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Ch 5: Generative Drone */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Ch 5: Generative Music</span>
                  <span>{mixerState?.ch5Volume ?? -6} dB</span>
                </div>
                <input
                  type="range"
                  data-testid="fader-ch5"
                  min="-60"
                  max="0"
                  step="1"
                  value={mixerState?.ch5Volume ?? -6}
                  onChange={(e) => updateMixerState({ ch5Volume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Master LPF Override */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="lpf-override-toggle" className="font-sans text-xs tracking-wider uppercase font-semibold text-slate-200 block">
                    Master LPF Override
                  </label>
                  <span className="text-[10px] text-slate-400 block">Bypass dynamic filter curve</span>
                </div>
                <input
                  id="lpf-override-toggle"
                  type="checkbox"
                  data-testid="lpf-override-toggle"
                  checked={Boolean(mixerState?.lpfOverride)}
                  onChange={(e) => updateMixerState({ lpfOverride: e.target.checked })}
                  className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
                />
              </div>

              {mixerState?.lpfOverride && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span>Cutoff Frequency</span>
                    <span>{mixerState?.lpfOverrideFreq ?? 2000} Hz</span>
                  </div>
                  <input
                    type="range"
                    data-testid="fader-lpf-override"
                    min="200"
                    max="5000"
                    step="50"
                    value={mixerState?.lpfOverrideFreq ?? 2000}
                    onChange={(e) => updateMixerState({ lpfOverrideFreq: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-sans text-xs tracking-widest uppercase transition-all font-semibold"
            >
              Apply & Close
            </button>

          </div>
          </div>
        </div>
      )}
    </>
  );
};
