import { describe, it, expect } from 'vitest';
import { calculateBpmAtTime, calculateVolumeAtTime } from '../engine/lifecycleRampEngine';

describe('Phase 6: 4-Phase System Lifecycle & Automation Scheduling TDD Tests', () => {
  it('Test 1: BPM Deceleration Ramp Accuracy', () => {
    // Setup/Mocking: Set T_sol = 20m, BPM_start = 70
    const solTargetMinutes = 20;
    const bpmStart = 70;
    const timeMinutes = 10; // Exactly halfway through Descent phase

    // Action: Evaluate the BPM value curve at t = 10m
    const evaluatedBpm = calculateBpmAtTime({ bpmStart, solTargetMinutes, timeMinutes });

    // Assertion: Ensure evaluated BPM is exactly 60 BPM
    expect(evaluatedBpm).toBe(60);
  });

  it('Test 2: Exponential Volume Fade Threshold', () => {
    // Setup/Mocking: Set T_total = 30m. Fast forward timeline to t = 25m (middle of Fade Phase)
    const totalRuntimeMinutes = 30;
    const timeMinutes = 25;

    // Action: Query volume calculation
    const evaluatedVolume = calculateVolumeAtTime({ totalRuntimeMinutes, timeMinutes, initialVolumeDb: 0 });

    // Assertion: Ensure volume is calculating a negative exponential value towards -Infinity and is no longer normalized
    expect(evaluatedVolume).toBeLessThan(0); // No longer normalized at 0 dB
    expect(evaluatedVolume).toBeGreaterThan(-Infinity);
    expect(evaluatedVolume).toBe(-15); // At t=25m, progress=0.5 -> 0 - 60 * 0.25 = -15 dB
  });
});
