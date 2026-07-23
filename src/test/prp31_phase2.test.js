import { describe, it, expect } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('PRP #31 Phase 2: Building the Generative Loops', () => {
  it('instantiates harmonicLoop and melodicLoop inside bootEngine()', async () => {
    await audioController.bootEngine();
    expect(audioController.harmonicLoop).toBeDefined();
    expect(audioController.melodicLoop).toBeDefined();
    expect(typeof audioController.harmonicLoop.start).toBe('function');
    expect(typeof audioController.melodicLoop.start).toBe('function');
  });
});
