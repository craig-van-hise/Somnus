import { describe, it, expect, vi } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import * as Tone from 'tone';

describe('Phase 3: Nature Buffer Await', () => {
  it('should await Tone.loaded() during bootEngine to guarantee buffer resolution', async () => {
    const loadedSpy = vi.spyOn(Tone, 'loaded').mockResolvedValue(true);

    audioController.isInitialized = false;
    await audioController.bootEngine();

    expect(loadedSpy).toHaveBeenCalled();
    expect(audioController.isInitialized).toBe(true);

    loadedSpy.mockRestore();
  });
});
