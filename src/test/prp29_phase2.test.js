import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PRP #29 Phase 2: Asset Cleanup', () => {
  it('verifies that public/assets/silence.wav has been deleted', () => {
    const silenceWavPath = path.resolve(process.cwd(), 'public/assets/silence.wav');
    const fileExists = fs.existsSync(silenceWavPath);
    expect(fileExists).toBe(false);
  });
});
