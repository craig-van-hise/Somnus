import { describe, it, expect } from 'vitest';
import { PitchMarkovEngine } from '../engine/pitchEngine';

describe('PRP #30 Phase 2: Generative Pitch Array Shift (G Major)', () => {
  it('returns candidate notes exclusively from the G Major Pentatonic array when generateLayer2Pitches is called', () => {
    const engine = new PitchMarkovEngine();
    const validPitches = engine.generateLayer2Pitches('G2');
    const expectedGMajorPentatonic = ['G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'A4', 'B4', 'D5', 'E5', 'G5'];

    expect(validPitches.length).toBeGreaterThan(0);
    validPitches.forEach((note) => {
      expect(expectedGMajorPentatonic).toContain(note);
    });
  });
});
