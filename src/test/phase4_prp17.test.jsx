import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppProvider, useApp } from '../context/AppContext';
import { SettingsModal } from '../components/SettingsModal';

describe('Phase 4 (PRP 17): Advanced GUI Controls Integration TDD Tests', () => {
  it('Test 1: Render Diagnostic Faders', async () => {
    render(
      <AppProvider customPreloadPromise={Promise.resolve()}>
        <SettingsModal />
      </AppProvider>
    );

    // Open settings modal via cog button
    const cogButton = screen.getByTestId('settings-cog-button');
    fireEvent.click(cogButton);

    expect(screen.getByTestId('fader-ch1')).toBeInTheDocument();
    expect(screen.getByTestId('fader-ch2')).toBeInTheDocument();
    expect(screen.getByTestId('fader-ch3')).toBeInTheDocument();
    expect(screen.getByTestId('fader-ch4')).toBeInTheDocument();
    expect(screen.getByTestId('fader-ch5')).toBeInTheDocument();
    expect(screen.getByTestId('fader-nature-blend')).toBeInTheDocument();
  });

  it('Test 2: Context Updating on Fader Interaction', async () => {
    let latestContext;
    const ContextViewer = () => {
      latestContext = useApp();
      return null;
    };

    render(
      <AppProvider customPreloadPromise={Promise.resolve()}>
        <ContextViewer />
        <SettingsModal />
      </AppProvider>
    );

    // Open modal
    const cogButton = screen.getByTestId('settings-cog-button');
    fireEvent.click(cogButton);

    const blendFader = screen.getByTestId('fader-nature-blend');

    act(() => {
      fireEvent.change(blendFader, { target: { value: '0.8' } });
    });

    expect(latestContext.mixerState.natureBlend).toBe(0.8);
  });
});
