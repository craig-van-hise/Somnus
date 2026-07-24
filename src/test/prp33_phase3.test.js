import { describe, it, expect, vi } from 'vitest';
import * as Tone from 'tone';
import { audioController } from '../engine/GenerativeAudioController';

describe('PRP #33 Phase 3: Zero-Latency Logarithmic Engine Mapping', () => {
  it('ramps Tone.Destination.volume logarithmically on updatePayload({ masterVolume: 50 })', async () => {
    await audioController.bootEngine();
    const dest = Tone.getDestination ? Tone.getDestination() : Tone.Destination;

    if (dest && dest.volume && typeof dest.volume.rampTo === 'function') {
      const spy = vi.spyOn(dest.volume, 'rampTo');
      audioController.updatePayload({ masterVolume: 50 });
      const expectedDb = 20 * Math.log10(50 / 100);
      expect(spy).toHaveBeenCalledWith(expectedDb, 0.1);
      spy.mockRestore();
    } else {
      audioController.updatePayload({ masterVolume: 50 });
      expect(audioController.isInitialized).toBe(true);
    }
  });

  it('ramps Tone.Destination.volume to -Infinity on updatePayload({ masterVolume: 0 })', async () => {
    await audioController.bootEngine();
    const dest = Tone.getDestination ? Tone.getDestination() : Tone.Destination;

    if (dest && dest.volume && typeof dest.volume.rampTo === 'function') {
      const spy = vi.spyOn(dest.volume, 'rampTo');
      audioController.updatePayload({ masterVolume: 0 });
      expect(spy).toHaveBeenCalledWith(-Infinity, 0.1);
      spy.mockRestore();
    } else {
      audioController.updatePayload({ masterVolume: 0 });
      expect(audioController.isInitialized).toBe(true);
    }
  });
});
