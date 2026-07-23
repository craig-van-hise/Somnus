import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import { AppProvider, useApp } from '../context/AppContext';

const TestComponent = () => {
  const { currentState, updateCurrentState } = useApp();
  return (
    <div>
      <span data-testid="val">{currentState}</span>
      <button onClick={() => updateCurrentState(0.75)}>Update</button>
    </div>
  );
};

describe('Phase 3: LocalStorage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize state from localStorage if it exists', () => {
    localStorage.setItem('somnus_currentState', '0.85');

    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(getByTestId('val').textContent).toBe('0.85');
  });

  it('should write to localStorage when state updates', () => {
    const { getByText } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      getByText('Update').click();
    });

    expect(localStorage.getItem('somnus_currentState')).toBe('0.75');
  });
});
