// CJS mock for ora (ESM-only in v9+) to allow schematics tests to run under Jest
'use strict';

const mockSpinner = {
  start: () => mockSpinner,
  stop: () => mockSpinner,
  succeed: () => mockSpinner,
  fail: () => mockSpinner,
  warn: () => mockSpinner,
  info: () => mockSpinner,
  text: '',
  prefixText: '',
};

const ora = () => mockSpinner;
ora.default = ora;

module.exports = ora;
module.exports.default = ora;
