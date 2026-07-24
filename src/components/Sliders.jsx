import React from 'react';
import { useApp } from '../context/AppContext';

export const Sliders = () => {
  const {
    sessionDuration,
    currentState,
    masterVolume,
    updateSessionDuration,
    updateCurrentState,
    updateMasterVolume,
  } = useApp();

  const handleStateChange = (e) => {
    updateCurrentState(e.target.value);
  };

  const handleDurationChange = (e) => {
    updateSessionDuration(e.target.value);
  };

  return (
    <div className="w-full max-w-sm space-y-3">
      {/* Session Duration Slider */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 shadow-lg space-y-3">
        <div className="flex justify-between items-center text-xs font-sans tracking-widest text-slate-200">
          <span className="uppercase">Session Duration</span>
          <span className="font-mono text-cyan-300 font-bold">{sessionDuration} min</span>
        </div>
        <input
          type="range"
          data-testid="duration-slider"
          min="30"
          max="120"
          step="1"
          value={sessionDuration}
          onChange={handleDurationChange}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono tracking-wider">
          <span>30m</span>
          <span>75m</span>
          <span>120m</span>
        </div>
      </div>

      {/* Current State Slider */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 shadow-lg space-y-3">
        <div className="flex justify-between items-center text-xs font-sans tracking-widest text-slate-200">
          <span className="uppercase">Current State</span>
          <span className="font-mono text-indigo-300 font-bold">{parseFloat(currentState).toFixed(2)}</span>
        </div>
        <input
          type="range"
          data-testid="state-slider"
          min="0.00"
          max="1.00"
          step="0.01"
          value={currentState}
          onChange={handleStateChange}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono tracking-wider">
          <span>Awake (0.00)</span>
          <span>Drowsy (0.50)</span>
          <span>Deep Sleep (1.00)</span>
        </div>
      </div>

      {/* Master Volume Slider */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 shadow-lg space-y-3">
        <div className="flex justify-between items-center text-xs font-sans tracking-widest text-slate-200">
          <span className="uppercase">Master Volume</span>
          <span className="font-mono text-emerald-300 font-bold">{masterVolume}%</span>
        </div>
        <input
          type="range"
          data-testid="master-volume-slider"
          min="0"
          max="100"
          step="1"
          value={masterVolume}
          onChange={(e) => updateMasterVolume(e.target.value)}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono tracking-wider">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
