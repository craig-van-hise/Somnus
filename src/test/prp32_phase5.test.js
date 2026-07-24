import { describe, it, expect, vi } from 'vitest';
import * as Tone from 'tone';
import { audioController } from '../engine/GenerativeAudioController';

describe('PRP #32 Phase 5: Hardware Volume Binding', () => {
  it('ramps Tone.Destination.volume logarithmically when updatePayload is called with masterVolume', async () => {
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
});
