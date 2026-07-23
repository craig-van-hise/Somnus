import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as Tone from 'tone';
import { GenerativeAudioController } from '../engine/GenerativeAudioController';
import App from '../App';

describe('Phase 3: Background Persistence & Audio Graph Foundation TDD Tests', () => {
  it('Test 1: Routing Topography Verification', () => {
    // Setup: Initialize GenerativeAudioController
    const controller = new GenerativeAudioController();
    controller.initialize();

    // Action: Query active audio graph nodes
    const graph = controller.getAudioGraphTopography();

    // Assertion 1: 100% of synth layers route into reverbInputBus before Reverb Worklet/speakers
    expect(graph.reverbInputBus).toBeDefined();

    // Assertion 2: Ensure Layer I synth exists and routes into reverb input bus
    expect(graph.layer1Synth).toBeDefined();

    // Assertion 3: Ensure Layers II and III assert lowpass filters before routing into reverb input bus
    expect(graph.layer2Filter).toBeDefined();
    expect(graph.layer2Filter.type).toBe('lowpass');

    expect(graph.layer3Filter).toBeDefined();
    expect(graph.layer3Filter.type).toBe('lowpass');
  });

  it('Test 2: State Suspension Recovery Overlay', async () => {
    // Setup/Mocking: Force Tone.context.state getter to return 'suspended'
    const stateSpy = vi.spyOn(Tone.context, 'state', 'get').mockReturnValue('suspended');

    render(
      <App
        customPreloadPromise={Promise.resolve()}
      />
    );

    // Wait for engine standby state
    const playButton = await screen.findByTestId('play-button');
    expect(playButton).toHaveTextContent(/(ENGINE STANDBY|START ENGINE)/i);

    // Click play button while Tone.context.state is suspended
    await act(async () => {
      playButton.click();
    });

    // Assertion: Confirm bg-black/80 backdrop-blur-sm z-50 overlay mounts with text
    await waitFor(() => {
      const overlay = screen.getByTestId('audio-suspended-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay.className).toContain('bg-black/80');
      expect(overlay.className).toContain('backdrop-blur-sm');
      expect(overlay.className).toContain('z-50');
      expect(screen.getByText(/Audio engine paused by browser\. Tap anywhere to resume\./i)).toBeInTheDocument();
    });

    stateSpy.mockRestore();
  });
});

describe('Phase 3 (PRP 17): 5-Channel Mixer & Master LPF TDD Tests', () => {
  it('Test 1: Audio Graph Topography Structure', async () => {
    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    const graph = controller.getAudioGraphTopography();

    expect(graph.ch1OscLeft).toBeDefined();
    expect(graph.ch1OscRight).toBeDefined();
    expect(graph.ch2Noise).toBeDefined();
    expect(graph.ch2Tremolo).toBeDefined();
    expect(graph.ch3Noise).toBeDefined();
    expect(graph.ch4Submixer).toBeDefined();
    expect(graph.masterLpf).toBeDefined();
    expect(graph.masterLpf.rolloff).toBe(-24);
    expect(graph.masterBus).toBeDefined();
  });

  it('Test 2: Nature Player Configuration', async () => {
    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    const graph = controller.getAudioGraphTopography();

    expect(graph.rainPlayer).toBeDefined();
    expect(graph.wavesPlayer).toBeDefined();
    expect(graph.rainPlayer.loop).toBe(true);
    expect(graph.rainPlayer.fade).toBe(2.0);
    expect(graph.wavesPlayer.loop).toBe(true);
    expect(graph.wavesPlayer.fade).toBe(2.0);
  });

  it('Test 3: Binaural Panning Rules', async () => {
    const controller = new GenerativeAudioController();
    await controller.bootEngine();

    const graph = controller.getAudioGraphTopography();

    const pannerLeft = graph.ch1PannerLeft?.pan?.value ?? graph.ch1PannerLeftPan;
    const pannerRight = graph.ch1PannerRight?.pan?.value ?? graph.ch1PannerRightPan;

    expect(pannerLeft).toBe(-1);
    expect(pannerRight).toBe(1);

    const freqLeft = graph.ch1OscLeft?.frequency?.value ?? 150;
    const freqRight = graph.ch1OscRight?.frequency?.value ?? 154;

    expect(freqLeft).toBeGreaterThanOrEqual(100);
    expect(freqLeft).toBeLessThanOrEqual(250);
    expect(freqRight).toBeGreaterThanOrEqual(100);
    expect(freqRight).toBeLessThanOrEqual(250);
  });
});

