import { describe, it, expect } from 'vitest';
import { householderMatrixMix, calculateT60GainScalar } from '../engine/fdnReverbMath';

describe('Phase 4: 2OA FDN Reverb AudioWorklet & OBR WASM Pipeline TDD Tests', () => {
  it('Test 1: Householder Matrix Operator Efficiency', () => {
    // Setup/Mocking: Pass an array of 9 ones [1,1,1,1,1,1,1,1,1]
    const input = [1, 1, 1, 1, 1, 1, 1, 1, 1];

    // Action: Compute the matrix output
    const output = householderMatrixMix(input);

    // Assertion: Ensure output array evaluates to [-1,-1,-1,-1,-1,-1,-1,-1,-1]
    expect(output).toEqual([-1, -1, -1, -1, -1, -1, -1, -1, -1]);
    expect(output.length).toBe(9);
  });

  it('Test 2: T60 Loop Gain Scalar', () => {
    // Setup/Mocking: Pass T60 = 2.5s, fs = 48000, and d0 = 1601
    const t60 = 2.5;
    const fs = 48000;
    const d0 = 1601;

    // Action: Execute scalar generation
    const g0 = calculateT60GainScalar(t60, fs, d0);

    // Assertion: Output g0 exactly matches 10^(-3 * 1601 / (2.5 * 48000))
    const expected = Math.pow(10, (-3 * 1601) / (2.5 * 48000));
    expect(g0).toBe(expected);
  });
});
