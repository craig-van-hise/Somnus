import { describe, it, expect } from 'vitest';
import { GenerativeAudioController, audioController } from '../engine/GenerativeAudioController';
import { PitchMarkovEngine } from '../engine/pitchEngine';

describe('PRP #31 Phase 1: Imports & Initialization', () => {
  it('instantiates this.pitchEngine as an instance of PitchMarkovEngine on GenerativeAudioController', () => {
    const controller = new GenerativeAudioController();
    expect(controller.pitchEngine).toBeInstanceOf(PitchMarkovEngine);
  });
});
