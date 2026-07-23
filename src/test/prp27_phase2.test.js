import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalAssetCache, preloadAssets, fetchRainAmbience, fetchOceanAmbience } from '../services/assetLoader';

describe('PRP #27 Phase 2 TDD Checks', () => {
  beforeEach(() => {
    globalAssetCache.rainBuffer = null;
    globalAssetCache.oceanBuffer = null;
    vi.restoreAllMocks();
  });

  it('populates globalAssetCache.rainBuffer and globalAssetCache.oceanBuffer when preloadAssets resolves', async () => {
    const dummyRainBuffer = new ArrayBuffer(512);
    const dummyOceanBuffer = new ArrayBuffer(1024);

    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('rain.wav')) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(dummyRainBuffer),
        });
      }
      if (url.includes('ocean.mp3')) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(dummyOceanBuffer),
        });
      }
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(128)),
      });
    }));

    await preloadAssets();

    expect(globalAssetCache.rainBuffer).toBe(dummyRainBuffer);
    expect(globalAssetCache.oceanBuffer).toBe(dummyOceanBuffer);
  });
});
