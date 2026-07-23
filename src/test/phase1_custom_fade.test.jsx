import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 1: Dynamic Master Fade-In', () => {
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

  it('should use the payload masterFadeTime parameter for the fade-in duration', async () => {
    const rampSpy = vi.spyOn(audioController.masterBus.volume, 'rampTo');

    // Inject a custom 25-second fade via payload
    audioController.updatePayload({ masterFadeTime: 25 });
    await audioController.startSession();

    // Assert the engine dynamically read the payload for the duration
    expect(rampSpy).toHaveBeenCalledWith(0, 25);
  });
});
