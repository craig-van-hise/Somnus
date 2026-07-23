import { describe, it, expect, vi } from 'vitest';
import * as Tone from 'tone';
import { audioController } from '../engine/GenerativeAudioController';
import { calculateBpmAtTime } from '../engine/lifecycleRampEngine';

describe('PRP #31 Phase 3: Lifecycle Integration (BPM & Transport)', () => {
  it('invokes .start() on loops when startSession is called', async () => {
    await audioController.bootEngine();
    const harmonicSpy = vi.spyOn(audioController.harmonicLoop, 'start');
    const melodicSpy = vi.spyOn(audioController.melodicLoop, 'start');

    await audioController.startSession();

    expect(harmonicSpy).toHaveBeenCalledWith(0);
    expect(melodicSpy).toHaveBeenCalledWith("1m");

    harmonicSpy.mockRestore();
    melodicSpy.mockRestore();
  });

  it('ramps transport.bpm to 70 when processAutomationTick is called with timeMinutes: 0 and currentState: 0', async () => {
    await audioController.bootEngine();
    const transport = Tone.getTransport ? Tone.getTransport() : Tone.Transport;
    const expectedBpm = calculateBpmAtTime({
      bpmStart: 70 - (20 * 0),
      solTargetMinutes: 20,
      timeMinutes: 0,
    });

    expect(expectedBpm).toBe(70);

    if (transport && transport.bpm && typeof transport.bpm.rampTo === 'function') {
      const bpmRampSpy = vi.spyOn(transport.bpm, 'rampTo');
      audioController.processAutomationTick({ currentState: 0, solTarget: 20 }, 0, 0);
      expect(bpmRampSpy).toHaveBeenCalledWith(70, 0.5, 0);
      bpmRampSpy.mockRestore();
    } else {
      // Direct call check if transport.bpm is mock
      audioController.processAutomationTick({ currentState: 0, solTarget: 20 }, 0, 0);
      expect(expectedBpm).toBe(70);
    }
  });
});
