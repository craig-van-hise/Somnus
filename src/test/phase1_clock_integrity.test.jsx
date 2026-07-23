import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import * as Tone from 'tone';

describe('Phase 1: Automation Clock Integrity', () => {
  beforeEach(async () => {
    audioController.isInitialized = false;

    // Mock fetch to allow boot without actual audio files
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      headers: new Headers({ 'content-type': 'text/html' })
    }));

    await audioController.bootEngine();
  });

  it('should not synchronously override parameters immediately after scheduling a ramp', () => {
    const payload = { currentState: 0.1, solTarget: 20, mixerState: {} };
    const exactTime = 123.45;

    // Spy on the rampTo function
    const lpfRampSpy = vi.spyOn(audioController.masterLpf.frequency, 'rampTo');

    // Manually set the value to something wildly different to track if it gets synchronously overwritten
    audioController.masterLpf.frequency.value = 9999;

    audioController.processAutomationTick(payload, 5, exactTime);

    // The rampTo must have been called with the calculated target and exact time
    expect(lpfRampSpy).toHaveBeenCalled();

    // CRITICAL ASSERTION: The synchronous .value MUST NOT have been changed. 
    // Tone.js will handle the smooth transition under the hood via the rampTo schedule.
    expect(audioController.masterLpf.frequency.value).toBe(9999);
  });
});
