import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 2: Play/Pause/Reset Lifecycle & Envelopes', () => {
  beforeEach(async () => {
    audioController.isInitialized = false;
    await audioController.bootEngine();
  });

  it('should initialize masterBus at -Infinity dB to prevent transients', () => {
    expect(audioController.masterBus.volume.value).toBe(-Infinity);
  });

  it('should fade in smoothly over 10 seconds on start', async () => {
    const rampSpy = vi.spyOn(audioController.masterBus.volume, 'rampTo');
    await audioController.startSession();

    // Assert rampTo(target_volume, duration_in_seconds)
    expect(rampSpy).toHaveBeenCalledWith(0, 10);
  });

  it('should fade out over 1 second on pause', () => {
    const rampSpy = vi.spyOn(audioController.masterBus.volume, 'rampTo');
    audioController.pauseSession();

    expect(rampSpy).toHaveBeenCalledWith(-Infinity, 1);
  });
});
