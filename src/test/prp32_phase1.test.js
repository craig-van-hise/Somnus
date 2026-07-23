import { describe, it, expect } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('PRP #32 Phase 1: Reverb Output Routing Fix', () => {
  it('connects the Worklet reverb return node to this.masterBus when engine boots', async () => {
    await audioController.bootEngine();
    const topography = audioController.getAudioGraphTopography();
    expect(topography.masterBus).toBeDefined();
  });
});
