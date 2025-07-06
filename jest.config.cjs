// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^entities/(.*)$': '<rootDir>/src/entities/$1',
    '^widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
  },