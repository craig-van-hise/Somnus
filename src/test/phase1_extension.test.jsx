import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import { globalAssetCache, fetchOceanAmbience } from '../services/assetLoader';

describe('Phase 1: Extension Alignment', () => {
  beforeEach(() => {
    audioController.isInitialized = false;
  });

  it('should request ocean.mp3 instead of ocean.wav in assetLoader', async () => {
    const fetchSpy = vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(128)),
    }));

    await fetchOceanAmbience();

    const oceanCall = fetchSpy.mock.calls.find(call => call[0].includes('ocean.mp3'));
    expect(oceanCall).toBeDefined();

    vi.unstubAllGlobals();
  });
});
