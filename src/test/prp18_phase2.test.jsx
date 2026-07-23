import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppProvider, useApp } from '../context/AppContext';

describe('PRP 18 - Phase 2: React Context to Engine Payload Synchronization TDD Tests', () => {
  it('Test 1: updateMixerState Updates Engine Payload', async () => {
    let contextValue;
    const TestConsumer = () => {
      contextValue = useApp();
      return null;
    };

    render(
      <AppProvider customPreloadPromise={Promise.resolve()}>
        <TestConsumer />
      </AppProvider>
    );

    act(() => {
      contextValue.updateMixerState({ ch1Volume: -20 });
    });

    expect(contextValue.enginePayload.mixerState.ch1Volume).toBe(-20);
  });

  it('Test 2: Callback Invocation on Fader Change', async () => {
    const onParamUpdateSpy = vi.fn();
    let contextValue;
    const TestConsumer = () => {
      contextValue = useApp();
      return null;
    };

    render(
      <AppProvider
        customPreloadPromise={Promise.resolve()}
        onParamUpdate={onParamUpdateSpy}
      >
        <TestConsumer />
      </AppProvider>
    );

    act(() => {
      contextValue.updateMixerState({ ch3Volume: -15 });
    });

    expect(onParamUpdateSpy).toHaveBeenCalled();
    expect(onParamUpdateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        mixerState: expect.objectContaining({ ch3Volume: -15 }),
      })
    );
  });
});
