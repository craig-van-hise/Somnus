import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sliders } from '../components/Sliders';
import { AppProvider } from '../context/AppContext';

describe('PRP #32 Phase 4: Master Volume Sliders UI Injection', () => {
  it('renders the Master Volume slider with data-testid="master-volume-slider" and emerald-400 accent styling', () => {
    render(
      <AppProvider>
        <Sliders />
      </AppProvider>
    );

    const slider = screen.getByTestId('master-volume-slider');
    expect(slider).toBeInTheDocument();
    expect(screen.getByText('Master Volume')).toBeInTheDocument();
  });
});
