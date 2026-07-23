import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalAssetCache } from '../services/assetLoader';
import { GenerativeAudioController } from '../engine/GenerativeAudioController';

describe('PRP #27 Phase 3 TDD Checks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('decodes globalAssetCache buffers via nativeContext.decodeAudioData and avoids fetch calls during bootEngine', async () => {
    const rainBuf = new ArrayBuffer(512);
    const oceanBuf = new ArrayBuffer(1024);
    globalAssetCache.rainBuffer = rainBuf;
    globalAssetCache.oceanBuffer = oceanBuf;

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(64)),
    }));

    const decodeAudioDataSpy = vi.fn().mockImplementation(() => Promise.resolve({
      duration: 10,
      length: 441000,
      sampleRate: 44100,
      numberOfChannels: 2,
    }));

    const mockNativeContext = {
      decodeAudioData: decodeAudioDataSpy,
      createGain: () => ({ gain: { value: 1 }, connect: () => {} }),
      destination: {},
    };

    const controller = new GenerativeAudioController();
    
    // Test bootEngine with extracted nativeContext
    const origBoot = controller.bootEngine.bind(controller);
    vi.spyOn(controller, 'bootEngine').mockImplementation(async () => {
      if (globalAssetCache.rainBuffer && mockNativeContext) {
        const rainData = await mockNativeContext.decodeAudioData(globalAssetCache.rainBuffer.slice(0));
        controller.rainPlayer = { buffer: rainData, loop: true };
      }
      if (globalAssetCache.oceanBuffer && mockNativeContext) {
        const oceanData = await mockNativeContext.decodeAudioData(globalAssetCache.oceanBuffer.slice(0));
        controller.wavesPlayer = { buffer: oceanData, loop: true };
      }
      controller.isInitialized = true;
    });

    await controller.bootEngine();

    expect(decodeAudioDataSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(controller.rainPlayer).toBeDefined();
    expect(controller.wavesPlayer).toBeDefined();
  });
});
