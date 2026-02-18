import type { Config } from 'jest';
import {
  createDefaultEsmPreset,
  createDefaultPreset,
  ESM_TS_TRANSFORM_PATTERN,
  TS_EXT_TO_TREAT_AS_ESM,
} from 'ts-jest';

const esModules = ['@angular'];

const config: Config = {
  ...createDefaultPreset(),
  testPathIgnorePatterns: ['/node_modules/', '/lib/', 'cypress'],
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
};

export default config;
