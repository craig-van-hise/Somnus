import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController';
import * as Tone from 'tone';

describe('Phase 2: Engine Pre-Tick', () => {
  beforeEach(async () => {
    audioController.isInitialized = false;
    await audioController.bootEngine();
  });

  it('should execute processAutomationTick synchronously during startSession before fading in', async () => {
    const tickSpy = vi.spyOn(audioController, 'processAutomationTick');

    // Set a payload that would drastically change the LPF if processed
    audioController.updatePayload({ currentState: 1.0, solTarget: 15, mixerState: { ch1Volume: -30 } });

    await audioController.startSession();

    // Tick must have been called explicitly by startSession (plus any transport loop calls)
    expect(tickSpy).toHaveBeenCalled();

    // Verify the mixer state was actually applied to the nodes
    expect(audioController.ch1Volume.volume.value).toBe(-30);
  });
});
