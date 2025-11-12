module.exports = {
  testEnvironment: "node",
  verbose: true, 
  testMatch: ["**/tests/**/*.test.js"], 
  clearMocks: true, 
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "server.js",
    "routes/**/*.js",
    "controllers/**/*.js",
    "services/**/*.js",
  ],
};
