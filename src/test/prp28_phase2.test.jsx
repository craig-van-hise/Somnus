import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PlayButton } from '../components/PlayButton';
import { AppProvider } from '../context/AppContext';
import { audioController } from '../engine/GenerativeAudioController';

vi.mock('../engine/GenerativeAudioController', () => ({
  audioController: {
    startSession: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 50))),
    pauseSession: vi.fn(),
    resetSession: vi.fn(),
    startIOSKeepAlive: vi.fn(),
    setupMediaSession: vi.fn(),
  }
}));

describe('PRP #28 Phase 2: PlayButton Synchronous Click Handler Alignment', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls audioController.startIOSKeepAlive() before audioController.startSession() resolves', async () => {
    await act(async () => {
      render(
        <AppProvider customPreloadPromise={Promise.resolve()}>
          <PlayButton />
        </AppProvider>
      );
    });

    const button = await screen.findByTestId('play-button');
    await act(async () => {
      fireEvent.click(button);
    });

    // startIOSKeepAlive and setupMediaSession must be called synchronously/immediately upon click
    expect(audioController.startIOSKeepAlive).toHaveBeenCalledTimes(1);
    expect(audioController.setupMediaSession).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(audioController.startSession).toHaveBeenCalledTimes(1);
    });
  });
});
