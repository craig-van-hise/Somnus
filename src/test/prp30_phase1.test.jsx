import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsModal } from '../components/SettingsModal';
import { AppProvider } from '../context/AppContext';

describe('PRP #30 Phase 1: Settings UI Refactor', () => {
  it('displays "Ch 5: Generative Music" when the 5-channel mixer is inspected in SettingsModal', () => {
    render(
      <AppProvider>
        <SettingsModal />
      </AppProvider>
    );

    // Open settings modal
    const cogButton = screen.getByTestId('settings-cog-button');
    fireEvent.click(cogButton);

    // Assert Ch 5 label is updated to "Ch 5: Generative Music"
    expect(screen.getByText('Ch 5: Generative Music')).toBeInTheDocument();
    expect(screen.queryByText('Ch 5: Generative Drone')).not.toBeInTheDocument();
  });
});
