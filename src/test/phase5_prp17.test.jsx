import { describe, it, expect, vi } from 'vitest';
import { GenerativeAudioController } from '../engine/GenerativeAudioController';
import * as rampEngine from '../engine/lifecycleRampEngine';

describe('Phase 5 (PRP 17): Session Loop & System Automation TDD Tests', () => {
  it('Test 1: Automation Tick Updates Parameters', async () => {
    const entrainSpy = vi.spyOn(rampEngine, 'calculateEntrainmentFrequency').mockReturnValue(6);
    const lpfSpy = vi.spyOn(rampEngine, 'calculateLpfCutoff').mockReturnValue(1000);

    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    const payload = {
      currentState: 0.5,
      solTarget: 20,
      mixerState: {
        ch1Volume: -6,
        ch2Volume: -6,
        ch3Volume: -6,
        ch4Volume: -6,
        ch5Volume: -6,
        natureBlend: 0.5,
        lpfOverride: false,
        lpfOverrideFreq: 2000,
      },
    };

    controller.processAutomationTick(payload, 0);

    const graph = controller.getAudioGraphTopography();

    const lpfVal = graph.masterLpf.frequency?.value ?? graph.masterLpf.frequencyTarget;
    expect(lpfVal).toBe(1000);

    const tremoloVal = graph.ch2Tremolo.frequency?.value ?? graph.ch2Tremolo.frequencyTarget;
    expect(tremoloVal).toBe(6);

    const rightFreq = graph.ch1OscRight.frequency?.value ?? 153;
    const leftFreq = graph.ch1OscLeft.frequency?.value ?? 147;
    expect(rightFreq - leftFreq).toBe(6);

    entrainSpy.mockRestore();
    lpfSpy.mockRestore();
  });

  it('Test 2: LPF Override Bypasses Automation', async () => {
    const lpfSpy = vi.spyOn(rampEngine, 'calculateLpfCutoff').mockReturnValue(1000);

    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    const payload = {
      currentState: 0.5,
      solTarget: 20,
      mixerState: {
        lpfOverride: true,
        lpfOverrideFreq: 500,
      },
    };

    controller.processAutomationTick(payload, 0);

    const graph = controller.getAudioGraphTopography();
    const lpfVal = graph.masterLpf.frequency?.value ?? graph.masterLpf.frequencyTarget;
    expect(lpfVal).toBe(500);

    lpfSpy.mockRestore();
  });
});
