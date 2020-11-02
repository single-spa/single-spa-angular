module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/lib/', 'cypress'],
  globals: {
    'ts-jest': {
      tsConfig: {
        downlevelIteration: false,
      },
    },
  },
};
