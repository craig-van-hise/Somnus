import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';

describe('Phase 1: React Payload Hydration', () => {
  it('should immediately push the initial enginePayload to onParamUpdate on mount', () => {
    const mockOnParamUpdate = vi.fn();

    // Mock localStorage to ensure a specific payload is loaded
    vi.stubGlobal('localStorage', {
      getItem: (key) => {
        if (key === 'somnus_currentState') return '0.75';
        return null; // fallbacks for the rest
      },
      setItem: vi.fn(),
    });

    render(<AppProvider onParamUpdate={mockOnParamUpdate}><div /></AppProvider>);

    // The callback MUST be fired automatically on mount without user interaction
    expect(mockOnParamUpdate).toHaveBeenCalled();
    // The payload must contain the persisted value
    expect(mockOnParamUpdate.mock.calls[0][0].currentState).toBe(0.75);

    vi.unstubAllGlobals();
  });
});
