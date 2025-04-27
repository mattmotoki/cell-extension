module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@core(.*)$': '<rootDir>/src/core$1',
    '^@web(.*)$': '<rootDir>/src/platforms/web$1',
    '^@shared(.*)$': '<rootDir>/src/shared$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(d3|d3-array|d3-scale|d3-shape|d3-time|d3-time-format|d3-color|d3-interpolate|d3-format|d3-selection|d3-transition|d3-axis|d3-hierarchy|d3-path|d3-zoom)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ]
} 