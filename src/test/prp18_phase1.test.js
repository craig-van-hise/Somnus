import { describe, it, expect } from 'vitest';
import { GenerativeAudioController } from '../engine/GenerativeAudioController';

describe('PRP 18 - Phase 1: Spatial Centering Correction TDD Tests', () => {
  it('Test 1: Tremolo Spread is Zero', async () => {
    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    const graph = controller.getAudioGraphTopography();
    const ch2Tremolo = graph.ch2Tremolo;

    expect(ch2Tremolo).toBeDefined();
    expect(ch2Tremolo.spread).toBe(0);
  });
});
