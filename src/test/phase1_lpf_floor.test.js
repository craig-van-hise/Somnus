import { describe, it, expect } from 'vitest';
import { calculateLpfCutoff } from '../engine/lifecycleRampEngine';

describe('Phase 1: Deep Sleep LPF Floor Adjustment', () => {
  it('should strictly floor at 150Hz after the SOL target is reached', () => {
    // timeMinutes (25) is greater than solTargetMinutes (20)
    const cutoff = calculateLpfCutoff(0.5, 25, 20); 
    expect(cutoff).toBe(150);
  });
});
