import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppProvider, useApp } from '../context/AppContext';

describe('PRP #32 Phase 3: Global State Context Expansion', () => {
  it('initializes masterVolume and merges it into enginePayload when updateMasterVolume is called', async () => {
    vi.useFakeTimers();
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.masterVolume).toBeDefined();
    expect(typeof result.current.updateMasterVolume).toBe('function');

    act(() => {
      result.current.updateMasterVolume(50);
    });

    expect(result.current.masterVolume).toBe(50);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.enginePayload.masterVolume).toBe(50);
    vi.useRealTimers();
  });
});
