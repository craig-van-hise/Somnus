import { describe, it, expect, vi, afterEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController.js';

describe('PRP #29 Phase 1: In-Memory Base64 Silence Keep-Alive Injection', () => {
  afterEach(() => {
    audioController.stopIOSKeepAlive();
    vi.restoreAllMocks();
  });

  it('assigns audio.src strictly equal to the BASE64_SILENCE string', () => {
    const expectedBase64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    let createdAudio = null;

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'audio') {
        createdAudio = {
          src: '',
          loop: false,
          volume: 1,
          setAttribute: vi.fn(),
          play: vi.fn().mockReturnValue(Promise.resolve()),
          pause: vi.fn()
        };
        return createdAudio;
      }
      return document.createElement(tagName);
    });

    audioController.startIOSKeepAlive();

    expect(createdAudio).not.toBeNull();
    expect(createdAudio.src).toBe(expectedBase64);
  });
});
