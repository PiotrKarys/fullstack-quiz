module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  setupFiles: ["dotenv/config"],
};
