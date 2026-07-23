import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { App } from '../App';
import { audioController } from '../engine/GenerativeAudioController';

// Mock the nested components to prevent full UI rendering overhead
vi.mock('../components/PlayButton', () => ({ PlayButton: () => <div data-testid="mock-play" /> }));
vi.mock('../components/Sliders', () => ({ Sliders: () => <div /> }));
vi.mock('../components/SettingsModal', () => ({ SettingsModal: () => <div /> }));
vi.mock('../components/AudioSuspendedOverlay', () => ({ AudioSuspendedOverlay: () => <div /> }));

describe('Phase 2: App.jsx Payload Bridge', () => {
  beforeEach(() => {
    vi.spyOn(audioController, 'updatePayload');

    // Mock localStorage to guarantee AppContext pushes a payload on mount
    vi.stubGlobal('localStorage', {
      getItem: (key) => key === 'somnus_currentState' ? '0.66' : null,
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should pass the AppContext payload directly to audioController.updatePayload on mount', () => {
    render(<App />);

    // Assert that the bridge successfully routed the initialization payload to the engine
    expect(audioController.updatePayload).toHaveBeenCalled();
    const payloadPassed = audioController.updatePayload.mock.calls[0][0];
    expect(payloadPassed.currentState).toBe(0.66);
  });
});
