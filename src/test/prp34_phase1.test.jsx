import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlayButton } from '../components/PlayButton';
import { AppProvider } from '../context/AppContext';

describe('PRP #34 Phase 1: CSS Grid Alignment in PlayButton', () => {
  it('renders PlayButton utilizing grid-cols-[1fr_auto_1fr] class on parent wrapper', () => {
    render(
      <AppProvider>
        <PlayButton />
      </AppProvider>
    );

    const playBtn = screen.getByTestId('play-button');
    const parentContainer = playBtn.parentElement;
    expect(parentContainer.className).toContain('grid');
    expect(parentContainer.className).toContain('grid-cols-[1fr_auto_1fr]');
  });
});
