import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';

describe('Phase 1: Frontend Initialization & Gatekeeper TDD Tests', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Test 1: Gatekeeper Preload State', async () => {
    let resolveAssets;
    const mockPreloadPromise = new Promise((resolve) => {
      resolveAssets = resolve;
    });

    render(<App customPreloadPromise={mockPreloadPromise} />);

    // Query play button
    const playButton = screen.getByTestId('play-button');

    // Assertion 1: Button text equals INITIALIZING... and is disabled while pending
    expect(playButton).toBeDisabled();
    expect(playButton).toHaveTextContent(/INITIALIZING\.\.\./i);

    // Resolve preloading assets
    await act(async () => {
      resolveAssets();
    });

    // Assertion 2: Button transitions to ENGINE STANDBY and is enabled upon resolution
    await waitFor(() => {
      expect(playButton).not.toBeDisabled();
      expect(playButton).toHaveTextContent(/ENGINE STANDBY/i);
    });
  });

  it('Test 2: Slider Debouncing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onParamUpdateMock = vi.fn();

    render(
      <App
        customPreloadPromise={Promise.resolve()}
        onParamUpdate={onParamUpdateMock}
      />
    );

    // Wait for standby state
    const playButton = await screen.findByTestId('play-button');
    expect(playButton).toHaveTextContent(/ENGINE STANDBY/i);

    const stateSlider = screen.getByTestId('state-slider');

    // Action: Simulate 5 rapid changes to Current State slider within 50ms
    act(() => {
      fireEvent.change(stateSlider, { target: { value: '0.10' } });
      vi.advanceTimersByTime(10);
      fireEvent.change(stateSlider, { target: { value: '0.20' } });
      vi.advanceTimersByTime(10);
      fireEvent.change(stateSlider, { target: { value: '0.30' } });
      vi.advanceTimersByTime(10);
      fireEvent.change(stateSlider, { target: { value: '0.40' } });
      vi.advanceTimersByTime(10);
      fireEvent.change(stateSlider, { target: { value: '0.50' } });
    });

    // Assertion 1: Visual UI updates immediately (5 times, showing 0.50)
    expect(parseFloat(stateSlider.value)).toBe(0.5);
    expect(screen.getByText('0.50')).toBeInTheDocument();

    // Assertion 2: Mathematical parameter payload has not fired yet (0 times before 100ms)
    expect(onParamUpdateMock).not.toHaveBeenCalled();

    // Advance time by remaining debounce window to complete 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Assertion 3: Mathematical parameter payload fires exactly once with final parameter value
    expect(onParamUpdateMock).toHaveBeenCalledTimes(1);
    expect(onParamUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({ currentState: 0.5 })
    );
  });
});

describe('Phase 1 (PRP 17): Asset Pipeline & Context Expansion TDD Tests', () => {
  it('Test 1: Preload Nature Assets', async () => {
    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(512),
    });
    global.fetch = fetchMock;

    const { preloadAssets } = await import('../services/assetLoader');
    await preloadAssets();

    const fetchCalls = fetchMock.mock.calls.map((call) => call[0]);
    expect(fetchCalls.some((url) => url.includes('Rain/'))).toBe(true);
    expect(fetchCalls.some((url) => url.includes('Ocean Waves/'))).toBe(true);
    expect(fetchCalls.some((url) => url.includes('MIT_KEMAR'))).toBe(true);
    expect(fetchCalls.some((url) => url.includes('obr_renderer'))).toBe(true);

    global.fetch = originalFetch;
  });

  it('Test 2: AppContext Mixer State Initialization', async () => {
    const { AppProvider, useApp } = await import('../context/AppContext');

    let contextValue;
    const TestConsumer = () => {
      contextValue = useApp();
      return null;
    };

    render(
      <AppProvider customPreloadPromise={Promise.resolve()}>
        <TestConsumer />
      </AppProvider>
    );

    expect(contextValue.mixerState).toBeDefined();
    expect(contextValue.mixerState.ch1Volume).toBeDefined();
    expect(contextValue.mixerState.ch1Volume).toBe(-6);
    expect(contextValue.mixerState.natureBlend).toBe(0.5);
    expect(contextValue.mixerState.lpfOverride).toBeDefined();
  });
});

