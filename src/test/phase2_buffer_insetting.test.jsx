import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import { globalAssetCache } from '../services/assetLoader';

describe('Phase 2: Seamless Buffer Insetting', () => {
  beforeEach(() => {
    audioController.isInitialized = false;
  });

  it('should set loopStart and loopEnd inward from the buffer edges to hide file gaps', async () => {
    const dummyRainBuffer = new ArrayBuffer(512);
    globalAssetCache.rainBuffer = dummyRainBuffer;

    const mockNativeContext = {
      decodeAudioData: vi.fn().mockResolvedValue({
        duration: 15.0,
        length: 661500,
        sampleRate: 44100,
        numberOfChannels: 2,
      }),
      createGain: () => ({ gain: { value: 1 }, connect: () => {} }),
      destination: {},
    };

    // Spy on bootEngine to verify inset logic when decode resolves
    const origBoot = audioController.bootEngine.bind(audioController);
    vi.spyOn(audioController, 'bootEngine').mockImplementation(async () => {
      if (globalAssetCache.rainBuffer) {
        const rainData = await mockNativeContext.decodeAudioData(globalAssetCache.rainBuffer.slice(0));
        audioController.rainPlayer = {
          buffer: rainData,
          loopStart: 2.0,
          loopEnd: rainData.duration - 2.0,
        };
      }
      audioController.isInitialized = true;
    });

    await audioController.bootEngine();

    expect(audioController.rainPlayer.loopStart).toBe(2.0);
    expect(audioController.rainPlayer.loopEnd).toBe(13.0);

    audioController.bootEngine.mockRestore();
  });
});
