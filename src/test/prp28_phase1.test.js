import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioController } from '../engine/GenerativeAudioController.js';

describe('PRP #28 Phase 1: GenerativeAudioController startIOSKeepAlive', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
  });

  afterEach(() => {
    audioController.stopIOSKeepAlive();
    vi.restoreAllMocks();
  });

  it('creates only one <audio> element when called twice, but calls .play() both times', () => {
    const playMock = vi.fn().mockReturnValue(Promise.resolve());
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'audio') {
        return {
          src: '',
          loop: false,
          volume: 1,
          setAttribute: vi.fn(),
          play: playMock,
          pause: vi.fn()
        };
      }
      return originalDocument.createElement(tagName);
    });

    audioController.startIOSKeepAlive();
    expect(createElementSpy).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledTimes(1);

    audioController.startIOSKeepAlive();
    // Element should NOT be created again
    expect(createElementSpy).toHaveBeenCalledTimes(1);
    // But play() should be called a second time
    expect(playMock).toHaveBeenCalledTimes(2);
  });
});
