/*eslint no-undef: "off"*/

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  coverageReporters: ["cobertura", "html", "text"]
};
