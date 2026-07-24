import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('PRP #34 Phase 2: Vertical Whitespace Symmetrization', () => {
  it('renders main element with mt-10 and without space-y-10', () => {
    const { container } = render(<App />);
    const mainEl = container.querySelector('main');
    expect(mainEl).not.toBeNull();
    expect(mainEl.className).toContain('mt-10');
    expect(mainEl.className).not.toContain('space-y-10');
  });

  it('renders PlayButton wrapper with mb-10 class', () => {
    const { container } = render(<App />);
    const mainEl = container.querySelector('main');
    const playBtnWrapper = mainEl.firstChild;
    expect(playBtnWrapper.className).toContain('mb-10');
  });
});
