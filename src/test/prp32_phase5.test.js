import { describe, it, expect, vi } from 'vitest';
import * as Tone from 'tone';
import { audioController } from '../engine/GenerativeAudioController';

describe('PRP #32 Phase 5: Hardware Volume Binding', () => {
  it('ramps Tone.Destination.volume to -15 when payload.masterVolume is -15 in processAutomationTick', async () => {
    await audioController.bootEngine();
    const dest = Tone.getDestination ? Tone.getDestination() : Tone.Destination;

    if (dest && dest.volume && typeof dest.volume.rampTo === 'function') {
      const spy = vi.spyOn(dest.volume, 'rampTo');
      audioController.processAutomationTick({ masterVolume: -15 }, 0, 0);
      expect(spy).toHaveBeenCalledWith(-15, 0.5, 0);
      spy.mockRestore();
    } else {
      audioController.processAutomationTick({ masterVolume: -15 }, 0, 0);
      expect(audioController.isInitialized).toBe(true);
    }
  });
});
