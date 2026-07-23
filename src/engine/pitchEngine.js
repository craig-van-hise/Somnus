/**
 * Somnus Generative Pitch & Temporal Sub-Engine
 * Implements stochastic Markov chains for pitch generation, absorbing root collapse at T_sol,
 * and Perfect 12th vertical clearance between Layer I and Layer II.
 */

export const PENTATONIC_SCALE = [1, 2, 3, 5, 6];

export const noteToMidi = (noteStr) => {
  const noteMap = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  const match = noteStr.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60;
  const name = match[1];
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + noteMap[name];
};

export const midiToNote = (midiNum) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNum / 12) - 1;
  const name = noteNames[midiNum % 12];
  return `${name}${octave}`;
};

export class PitchMarkovEngine {
  constructor() {
    this.currentState = 1;
  }

  generateNextDegree({ currentTimeMinutes = 0, solTargetMinutes = 20 } = {}) {
    // Absorbing State Directive: matrix collapses to P(1 -> 1) = 1.0 when t >= T_sol
    if (currentTimeMinutes >= solTargetMinutes) {
      this.currentState = 1;
      return 1;
    }

    const transitionProbabilities = {
      1: [0.4, 0.2, 0.2, 0.1, 0.1],
      2: [0.3, 0.3, 0.2, 0.1, 0.1],
      3: [0.3, 0.2, 0.3, 0.1, 0.1],
      5: [0.4, 0.1, 0.1, 0.3, 0.1],
      6: [0.5, 0.1, 0.1, 0.1, 0.2],
    };

    const probs = transitionProbabilities[this.currentState] || transitionProbabilities[1];
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < PENTATONIC_SCALE.length; i++) {
      cumulative += probs[i];
      if (rand <= cumulative) {
        this.currentState = PENTATONIC_SCALE[i];
        return this.currentState;
      }
    }

    this.currentState = 1;
    return 1;
  }

  generateLayer2Pitches(layer1MaxPitchNote) {
    const layer1Midi = typeof layer1MaxPitchNote === 'string' ? noteToMidi(layer1MaxPitchNote) : layer1MaxPitchNote;
    // Perfect 12th clearance = 19 semitones minimum
    const minAllowedMidi = layer1Midi + 19;

    const candidateNotes = ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
    const validPitches = [];

    for (const note of candidateNotes) {
      if (noteToMidi(note) >= minAllowedMidi) {
        validPitches.push(note);
      }
    }

    return validPitches;
  }
}
