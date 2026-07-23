import '@testing-library/jest-dom';
import { vi } from 'vitest';

const originalStubGlobal = vi.stubGlobal;
vi.stubGlobal = function (name, value) {
  const result = originalStubGlobal.call(this, name, value);
  if (name === 'fetch' && value && value.mock) {
    try {
      Object.defineProperty(result, 'mock', {
        get() {
          return value.mock;
        },
        configurable: true,
      });
    } catch (e) {}
  }
  return result;
};

// Global mocks for Tone.js in test environment if needed
if (typeof window !== 'undefined') {
  let mockStorageStore = {};
  const storageImpl = {
    getItem: (key) => (mockStorageStore[key] !== undefined ? mockStorageStore[key] : null),
    setItem: (key, value) => {
      mockStorageStore[key] = String(value);
    },
    removeItem: (key) => {
      delete mockStorageStore[key];
    },
    clear: () => {
      mockStorageStore = {};
    },
    get length() {
      return Object.keys(mockStorageStore).length;
    },
    key: (i) => Object.keys(mockStorageStore)[i] || null,
  };

  try {
    Object.defineProperty(globalThis, 'localStorage', {
      value: storageImpl,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // fallback
  }
  try {
    Object.defineProperty(window, 'localStorage', {
      value: storageImpl,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // fallback
  }
  window.Tone = window.Tone || {
    start: vi.fn().mockResolvedValue(undefined),
    context: {
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
    },
  };
}
