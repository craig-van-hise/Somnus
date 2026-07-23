import { describe, it, expect, vi } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';

describe('PRP #30 Phase 3: Mathematical Detuning & Drone Silencing', () => {
  it('initializes layer2Synth and layer3Synth with detune: 35 when engine boots', async () => {
    await audioController.bootEngine();
    const topography = audioController.getAudioGraphTopography();

    // Check detune configuration options/properties
    const getDetuneVal = (synth) => {
      if (!synth) return undefined;
      if (typeof synth.detune === 'number') return synth.detune;
      if (synth.detune && synth.detune.value !== undefined) return synth.detune.value;
      if (synth.options && synth.options.detune !== undefined) return synth.options.detune;
      return synth.detune;
    };

    expect(getDetuneVal(topography.layer2Synth)).toBe(35);
    expect(getDetuneVal(topography.layer3Synth)).toBe(35);
  });

  it('does NOT invoke layer1Synth.triggerAttack when startSession is executed', async () => {
    await audioController.bootEngine();
    const topography = audioController.getAudioGraphTopography();
    const spy = vi.spyOn(topography.layer1Synth, 'triggerAttack');

    await audioController.startSession();

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
