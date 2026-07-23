import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 2: Vite Configuration', () => {
  it('should have the base path set to /Somnus/ in vite.config.js', () => {
    const configPath = path.resolve(process.cwd(), 'vite.config.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Regex to check if base: '/Somnus/' exists
    const hasBasePath = /base:\s*['"]\/Somnus\/['"]/.test(configContent);
    expect(hasBasePath).toBe(true);
  });
});
