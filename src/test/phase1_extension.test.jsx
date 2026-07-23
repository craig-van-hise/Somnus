import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('Phase 1: Extension Alignment', () => {
  beforeEach(() => {
    audioController.isInitialized = false;
  });

  it('should request ocean.mp3 instead of ocean.wav', async () => {
    const fetchSpy = vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, // Force it to fail gracefully so we don't need real buffers
      headers: new Headers({ 'content-type': 'text/html' })
    }));

    await audioController.bootEngine();

    const oceanCall = fetchSpy.mock.calls.find(call => call[0].includes('ocean.mp3'));
    expect(oceanCall).toBeDefined();

    vi.unstubAllGlobals();
  });
});
