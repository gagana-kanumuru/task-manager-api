const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
// jest.config.cjs
module.exports = {
  // ... other config ...
  testMatch: ["**/src/**/*.test.ts"],         // Only run TS tests in src/
  testPathIgnorePatterns: ["/node_modules/", "/dist/"], // Ignore dist/
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  // If your tests need more time:
  testTimeout: 20000, // 20 seconds (optional, to fix timeout errors)
};
