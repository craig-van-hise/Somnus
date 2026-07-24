import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sliders } from '../components/Sliders';
import { AppProvider } from '../context/AppContext';

describe('PRP #33 Phase 2: Logarithmic UI Slider Update', () => {
  it('renders Master Volume slider with 0-100 min/max and percentage labels', () => {
    render(
      <AppProvider>
        <Sliders />
      </AppProvider>
    );

    const slider = screen.getByTestId('master-volume-slider');
    expect(slider).toBeInTheDocument();
    expect(slider.getAttribute('min')).toBe('0');
    expect(slider.getAttribute('max')).toBe('100');

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getAllByText('100%').length).toBeGreaterThanOrEqual(1);
  });
});
