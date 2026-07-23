import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 2: Accurate Timing for Parameter Ramps', () => {
  beforeEach(async () => {
    audioController.isInitialized = false;
    await audioController.bootEngine();
  });

  it('should pass the atomic time parameter to all rampTo calls', () => {
    const payload = { currentState: 0.1, solTarget: 20, mixerState: {} };
    const elapsedSeconds = 5;
    const exactTime = 1234.56; // Mock atomic Tone.js time

    const lpfRampSpy = vi.spyOn(audioController.masterLpf.frequency, 'rampTo');
    const oscLeftRampSpy = vi.spyOn(audioController.ch1OscLeft.frequency, 'rampTo');

    audioController.processAutomationTick(payload, elapsedSeconds, exactTime);

    // Assert that the third argument passed to rampTo is the exact time
    expect(lpfRampSpy.mock.calls[0][2]).toBe(exactTime);
    expect(oscLeftRampSpy.mock.calls[0][2]).toBe(exactTime);
  });
});
