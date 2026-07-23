import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 2: Gentle Master Fade-In', () => {
  beforeEach(async () => {
    audioController.isInitialized = false;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      headers: new Headers({ 'content-type': 'text/html' })
    }));
    await audioController.bootEngine();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should fade in smoothly over 10 seconds on start instead of 3 seconds', async () => {
    const rampSpy = vi.spyOn(audioController.masterBus.volume, 'rampTo');

    await audioController.startSession();

    // Verify the duration parameter (second argument) is strictly 10
    expect(rampSpy).toHaveBeenCalledWith(0, 10);
  });
});
