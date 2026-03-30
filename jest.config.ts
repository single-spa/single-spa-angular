import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const config: Config = {
  ...createDefaultPreset(),
  testPathIgnorePatterns: ['/node_modules/', '/lib/', 'cypress'],
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
  moduleNameMapper: {
    // ora v9+ is ESM-only; mock it so @angular-devkit/schematics/testing can load under Jest (CJS)
    '^ora$': '<rootDir>/__mocks__/ora.js',
  },
};

export default config;
