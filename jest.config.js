module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  globals: {
    'ts-jest': {
      tsConfig: {
        downlevelIteration: false,
      },
    },
  },
};
