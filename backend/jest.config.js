process.env.NODE_ENV = "test";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {}],
  },
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
