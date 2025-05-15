// jest.config.js
module.exports = {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js',
    '<rootDir>/jest.setup.js',
  ],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testEnvironment: 'jsdom',

  // ✅ Coverage config here
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
    "!**/*.test.js",
  ],
  coverageDirectory: "coverage",
};
