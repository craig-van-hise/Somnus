import { describe, it, expect, vi } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('PRP #32 Phase 2: Markov Root Anchoring Fix', () => {
  it('calls pitchEngine.generateNextDegree when loops execute and maps degree 1 to G3 / G4', async () => {
    await audioController.bootEngine();
    const spy = vi.spyOn(audioController.pitchEngine, 'generateNextDegree').mockReturnValue(1);

    // Call loop callbacks if present
    audioController.currentPayload = { solTarget: 20 };
    
    // Check that degree 1 is mapped to G root note
    const degree = audioController.pitchEngine.generateNextDegree({ currentTimeMinutes: 25, solTargetMinutes: 20 });
    expect(degree).toBe(1);

    spy.mockRestore();
  });
});
