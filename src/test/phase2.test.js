import { describe, it, expect } from 'vitest';
import { calculateEngineParameters } from '../engine/parameterCalculator';

describe('Phase 2: Engine Mathematics & Parameter Mapping TDD Tests', () => {
  it('Test 1: Awake State Boundary Mathematics', () => {
    // Setup/Mocking: Feed D = 1.0 and S = 0.0
    const input = { durationNormalized: 1.0, currentState: 0.0 };

    // Action: Execute calculation
    const output = calculateEngineParameters(input);

    // Assertion: Validate T_total = 120, T_sol = 25, BPM_start = 80, Comp_start = 1.0
    expect(output.totalRuntimeMinutes).toBe(120);
    expect(output.solTargetMinutes).toBe(25);
    expect(output.startingBpm).toBe(80);
    expect(output.startingComplexity).toBe(1.0);
  });

  it('Test 2: Sleepy State Boundary Mathematics', () => {
    // Setup/Mocking: Feed D = 0.0 and S = 1.0
    const input = { durationNormalized: 0.0, currentState: 1.0 };

    // Action: Execute calculation
    const output = calculateEngineParameters(input);

    // Assertion: Validate T_total = 30, T_sol = 10, BPM_start = 60, Comp_start = 0.5
    expect(output.totalRuntimeMinutes).toBe(30);
    expect(output.solTargetMinutes).toBe(10);
    expect(output.startingBpm).toBe(60);
    expect(output.startingComplexity).toBe(0.5);
  });

  it('QA Debug Mode compressed values override', () => {
    const input = { durationNormalized: 0.8, currentState: 0.2, debugMode: true };
    const output = calculateEngineParameters(input);

    expect(output.totalRuntimeMinutes).toBe(3);
    expect(output.solTargetMinutes).toBe(1);
    expect(output.isDebugMode).toBe(true);
  });
});

describe('Phase 2 (PRP 17): 3-Phase Lifecycle & Parameter Engine TDD Tests', () => {
  it('Test 1: Linear Entrainment Descent (Awake)', async () => {
    const { calculateEntrainmentFrequency } = await import('../engine/lifecycleRampEngine');
    const currentState = 0.0;
    const solTargetMinutes = 20;

    expect(calculateEntrainmentFrequency(currentState, 0, solTargetMinutes)).toBe(10);
    expect(calculateEntrainmentFrequency(currentState, 10, solTargetMinutes)).toBe(6);
    expect(calculateEntrainmentFrequency(currentState, 20, solTargetMinutes)).toBe(2);
  });

  it('Test 2: Exponential LPF Cutoff (Sleepy)', async () => {
    const { calculateLpfCutoff } = await import('../engine/lifecycleRampEngine');
    const currentState = 1.0;
    const solTargetMinutes = 10;

    const valAt0 = calculateLpfCutoff(currentState, 0, solTargetMinutes);
    const valAt5 = calculateLpfCutoff(currentState, 5, solTargetMinutes);
    const valAt10 = calculateLpfCutoff(currentState, 10, solTargetMinutes);
    const valAt15 = calculateLpfCutoff(currentState, 15, solTargetMinutes);

    expect(valAt0).toBe(2000);
    expect(valAt10).toBe(150);
    expect(valAt15).toBe(150);
    expect(valAt5).toBeLessThan(2000);
    expect(valAt5).toBeGreaterThan(150);

    // Negative exponential check: decay rate from 0 to 5 should be steeper than from 5 to 10
    const diff1 = valAt0 - valAt5;
    const diff2 = valAt5 - valAt10;
    expect(diff1).toBeGreaterThan(diff2);
  });
});

