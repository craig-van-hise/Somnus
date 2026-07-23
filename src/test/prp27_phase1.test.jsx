import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { PlayButton } from '../components/PlayButton';
import { AppProvider, useApp } from '../context/AppContext';
import { audioController } from '../engine/GenerativeAudioController';

vi.mock('../engine/GenerativeAudioController', () => ({
  audioController: {
    startSession: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves to test pre-resolution state
    pauseSession: vi.fn(),
    resetSession: vi.fn(),
  },
}));

const StatusTester = () => {
  const { sessionStatus } = useApp();
  return <div data-testid="status-display">{sessionStatus}</div>;
};

describe('PRP #27 Phase 1 TDD Checks', () => {
  it('transitions sessionStatus immediately to "starting" when Play button clicked in standby', async () => {
    render(
      <AppProvider customPreloadPromise={Promise.resolve()}>
        <StatusTester />
        <PlayButton />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('status-display').textContent).toBe('standby');
    });

    const button = screen.getByTestId('play-button');
    
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId('status-display').textContent).toBe('starting');
    expect(audioController.startSession).toHaveBeenCalled();
  });

  it('renders "LOADING ENGINE..." and pulse/scale classes when sessionStatus is "starting"', async () => {
    const ComponentWithInitialStatus = () => {
      const { setSessionStatus } = useApp();
      return (
        <div>
          <button data-testid="set-starting" onClick={() => setSessionStatus('starting')}>
            Set Starting
          </button>
          <PlayButton />
        </div>
      );
    };

    render(
      <AppProvider customPreloadPromise={Promise.resolve()}>
        <ComponentWithInitialStatus />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('play-button').textContent).toContain('START ENGINE');
    });

    act(() => {
      fireEvent.click(screen.getByTestId('set-starting'));
    });

    const button = screen.getByTestId('play-button');
    expect(button.textContent).toContain('LOADING ENGINE...');
    expect(button.className).toContain('bg-indigo-500/30');
    expect(button.className).toContain('scale-105');
  });
});
