import { describe, it, expect } from 'vitest';
import { GenerativeAudioController } from '../engine/GenerativeAudioController';

describe('PRP 18 - Phase 3: Real-Time Audio Node Binding & Generative Muting TDD Tests', () => {
  it('Test 1: applyMixerState Mutates Volume Nodes', async () => {
    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    controller.applyMixerState({ ch1Volume: -12, ch2Volume: -24 });

    const graph = controller.getAudioGraphTopography();
    expect(graph.ch1Volume.volume.value).toBe(-12);
    expect(graph.ch2Volume.volume.value).toBe(-24);
  });

  it('Test 2: Generative Muting Default', async () => {
    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    const graph = controller.getAudioGraphTopography();
    expect(graph.ch5Volume.volume.value).toBe(-Infinity);
  });
});
