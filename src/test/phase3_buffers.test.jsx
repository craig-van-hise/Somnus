import { describe, it, expect } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 3: Nature Buffer Await', () => {
  it('should bypass network buffer await during zero-latency bootEngine', async () => {
    audioController.isInitialized = false;
    await audioController.bootEngine();
    expect(audioController.isInitialized).toBe(true);
  });
});
