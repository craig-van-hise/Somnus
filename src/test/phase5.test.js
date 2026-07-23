import { describe, it, expect } from 'vitest';
import { PitchMarkovEngine, noteToMidi } from '../engine/pitchEngine';

describe('Phase 5: Generative Pitch & Temporal Sub-Engines TDD Tests', () => {
  it('Test 1: Absorbing Root Pitch Collapse', () => {
    // Setup: Initialize PitchMarkovEngine and artificially advance time to t = T_sol + 1
    const engine = new PitchMarkovEngine();
    const solTargetMinutes = 20;
    const currentTimeMinutes = 21; // t >= T_sol

    // Action: Request 100 pitch generation cycles
    const generatedDegrees = [];
    for (let i = 0; i < 100; i++) {
      generatedDegrees.push(engine.generateNextDegree({ currentTimeMinutes, solTargetMinutes }));
    }

    // Assertion: Ensure all 100 generated pitches strictly equal the Root (1) note
    const allRoot = generatedDegrees.every((deg) => deg === 1);
    expect(allRoot).toBe(true);
    expect(generatedDegrees.length).toBe(100);
  });

  it('Test 2: Perfect 12th Vertical Clearance', () => {
    // Setup: Force Layer I to output pitch C2
    const engine = new PitchMarkovEngine();
    const layer1Pitch = 'C2';

    // Action: Query the generative engine for valid Layer II pitch array
    const validLayer2Pitches = engine.generateLayer2Pitches(layer1Pitch);

    // Assertion: Ensure minimum pitch allowed for Layer II is strictly bounded to G3 or higher (G3 = midi 55, C2 = midi 36)
    expect(validLayer2Pitches.length).toBeGreaterThan(0);
    const minMidi = noteToMidi(validLayer2Pitches[0]);
    const g3Midi = noteToMidi('G3'); // 55
    const c2Midi = noteToMidi('C2'); // 36

    expect(minMidi).toBeGreaterThanOrEqual(g3Midi);
    expect(minMidi - c2Midi).toBeGreaterThanOrEqual(19); // 19 semitones = Perfect 12th
  });
});
