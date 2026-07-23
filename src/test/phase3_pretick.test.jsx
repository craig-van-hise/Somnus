import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 3: Pre-Tick Initialization', () => {
  beforeEach(async () => {
    audioController.isInitialized = false;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      headers: new Headers({ 'content-type': 'text/html' })
    }));

    await audioController.bootEngine();
  });

  it('should manually invoke processAutomationTick right before fading in', async () => {
    const tickSpy = vi.spyOn(audioController, 'processAutomationTick');

    // Inject a known payload
    audioController.updatePayload({ currentState: 1.0, mixerState: { ch1Volume: -40 } });

    await audioController.startSession();

    expect(tickSpy).toHaveBeenCalled();
    // The mixer state must be evaluated before the fade begins
    expect(audioController.ch1Volume.volume.value).toBe(-40);
  });
});
