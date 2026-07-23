import { describe, it, expect, vi } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import * as Tone from 'tone';

describe('Phase 1: Decoding Error Boundaries', () => {
  it('should catch decoding errors and still initialize the engine', async () => {
    // Force Tone.loaded to throw a mock EncodingError
    const loadedStub = vi.spyOn(Tone, 'loaded').mockRejectedValue(new Error('EncodingError: Unable to decode audio data'));

    audioController.isInitialized = false;
    await audioController.bootEngine();

    // Engine must still initialize despite the crash
    expect(audioController.isInitialized).toBe(true);
    // Player loaded flags should be forcibly flipped to prevent starting dead nodes
    expect(audioController.rainPlayer.loaded).toBe(false);
    expect(audioController.wavesPlayer.loaded).toBe(false);

    loadedStub.mockRestore();
  });
});
