module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/lib/', 'cypress'],
  globals: {
    'ts-jest': {
      tsconfig: {
        downlevelIteration: true,
        lib: ['es2018', 'dom', 'ES2019.Array'],
      },
    },
  },
};
