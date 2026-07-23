import { describe, it, expect, vi } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import * as Tone from 'tone';

describe('Phase 3: Asset URL Encoding', () => {
  it('should initialize Tone.Player with URI-encoded paths to prevent 404 HTML fallback crashes', async () => {
    const playerSpy = vi.spyOn(Tone, 'Player');

    audioController.isInitialized = false;
    await audioController.bootEngine();

    // Extract the arguments passed to Tone.Player
    const rainArgs = playerSpy.mock.calls.find(call => call[0].url && call[0].url.includes('Rain'));
    const waveArgs = playerSpy.mock.calls.find(call => call[0].url && call[0].url.includes('Ocean'));

    expect(rainArgs).toBeDefined();
    // The URL must strictly equal the encoded version
    expect(rainArgs[0].url).toBe(encodeURI('/Nature Sounds Audio/Rain/rain.wav'));
    expect(waveArgs[0].url).toBe(encodeURI('/Nature Sounds Audio/Ocean Waves/ocean.wav'));

    playerSpy.mockRestore();
  });
});
