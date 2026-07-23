import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 3: CI/CD Pipeline Integration', () => {
  it('should create a valid GitHub Actions deploy.yml file', () => {
    const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');

    // Assert the file physically exists
    expect(fs.existsSync(workflowPath)).toBe(true);

    const workflowContent = fs.readFileSync(workflowPath, 'utf-8');

    // Assert core GitHub Actions configurations for Vite -> GH Pages
    expect(workflowContent).toContain('npm run build');
    expect(workflowContent).toContain('actions/upload-pages-artifact');
    expect(workflowContent).toContain('actions/deploy-pages');
    expect(workflowContent).toContain('branches:');
  });
});
