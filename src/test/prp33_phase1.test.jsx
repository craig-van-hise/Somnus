import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('PRP #33 Phase 1: CSS Layout & Scroll Fixes', () => {
  it('renders settings cog button positioned at top-right z-40', () => {
    render(<App />);
    const cogButton = screen.getByTestId('settings-cog-button');
    expect(cogButton).toBeInTheDocument();
    expect(cogButton.className).toContain('fixed');
    expect(cogButton.className).toContain('top-6');
    expect(cogButton.className).toContain('right-6');
    expect(cogButton.className).toContain('z-40');
  });

  it('renders main layout with min-h-screen, overflow-y-auto, and pb-24', () => {
    const { container } = render(<App />);
    const rootDiv = container.firstChild;
    expect(rootDiv.className).toContain('min-h-screen');
    expect(rootDiv.className).toContain('overflow-y-auto');
    expect(rootDiv.className).toContain('pb-24');
  });
});
