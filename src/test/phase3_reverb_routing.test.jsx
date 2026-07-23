import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 3: 3D Reverb Routing Isolation', () => {
  beforeEach(() => {
    audioController.isInitialized = false;
    vi.spyOn(audioController, 'safeLoadBuffer').mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should instantiate the reverbInputBus and ch5Volume independently', async () => {
    await audioController.bootEngine();

    expect(audioController.ch5Volume).toBeDefined();
    expect(audioController.reverbInputBus).toBeDefined();
  });
});
