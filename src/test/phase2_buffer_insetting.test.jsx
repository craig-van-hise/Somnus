import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import * as Tone from 'tone';

describe('Phase 2: Seamless Buffer Insetting', () => {
  beforeEach(() => {
    audioController.isInitialized = false;
  });

  it('should set loopStart and loopEnd inward from the buffer edges to hide file gaps', async () => {
    // Mock a successful safeLoadBuffer response
    vi.spyOn(audioController, 'safeLoadBuffer').mockResolvedValue({
      duration: 15.0 // Mock a 15-second buffer
    });

    await audioController.bootEngine();

    // Ensure the loop boundaries are inset by exactly 2 seconds
    expect(audioController.rainPlayer.loopStart).toBe(2.0);
    expect(audioController.rainPlayer.loopEnd).toBe(13.0); // 15.0 - 2.0

    audioController.safeLoadBuffer.mockRestore();
  });
});
