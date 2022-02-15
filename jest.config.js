/*eslint no-undef: "off"*/

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  coverageReporters: ["cobertura", "html", "text"],
  coveragePathIgnorePatterns: ["setupTests.ts", "react-app-env.d.ts", "global.d.ts"],
  moduleNameMapper: { "\\.(css)$": "identity-obj-proxy" },
  setupFilesAfterEnv: ["./src/setupTests.ts"]
};
