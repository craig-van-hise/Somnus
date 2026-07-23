import { describe, it, expect } from 'vitest';
import { calculateLpfCutoff } from '../engine/lifecycleRampEngine';

describe('Phase 1: Master LPF Math Correction', () => {
  it('should start at 5000Hz when Awake (0.0)', () => {
    const cutoff = calculateLpfCutoff(0.0, 0, 20);
    expect(cutoff).toBe(5000);
  });

  it('should start at 2000Hz when Sleepy (1.0)', () => {
    const cutoff = calculateLpfCutoff(1.0, 0, 20);
    expect(cutoff).toBe(2000);
  });

  it('should strictly floor at 150Hz after the SOL target is reached', () => {
    const cutoff = calculateLpfCutoff(0.5, 25, 20);
    expect(cutoff).toBe(150);
  });
});
