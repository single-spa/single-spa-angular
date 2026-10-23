import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const preset = createDefaultPreset({ tsconfig: { types: ['jest', 'node'] } });

const config: Config = {
  ...preset,
  transform: {
    ...preset.transform,
    // magic-string is ESM-only, and @angular-devkit/schematics loads it with require().
    // Compile it to CommonJS, because Jest cannot require() ES modules without a flag.
    '^.+\\.mjs$': ['babel-jest', { plugins: ['@babel/plugin-transform-modules-commonjs'] }],
  },
  transformIgnorePatterns: ['/node_modules/(?!\\.pnpm/magic-string@|magic-string/)'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/', 'cypress'],
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
  moduleNameMapper: {
    // ora v9+ is ESM-only; mock it so @angular-devkit/schematics/testing can load under Jest (CJS)
    '^ora$': '<rootDir>/__mocks__/ora.js',
  },
};

export default config;
