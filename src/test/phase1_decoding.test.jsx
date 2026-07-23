import { describe, it, expect, vi } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 1: Decoding Error Boundaries', () => {
  it('should catch decoding errors and still initialize the engine', async () => {
    audioController.isInitialized = false;
    await audioController.bootEngine();

    // Engine must still initialize despite error fallbacks
    expect(audioController.isInitialized).toBe(true);
    expect(audioController.rainPlayer).toBeDefined();
    expect(audioController.wavesPlayer).toBeDefined();
  });
});
