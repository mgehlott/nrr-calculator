export default {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
};
