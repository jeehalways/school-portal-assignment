const js = require("@eslint/js");
const ts = require("typescript-eslint");
const prettier = require("eslint-config-prettier");

module.exports = ts.config({
  ignores: ["dist/**", "node_modules/**"],

  extends: [
    js.configs.recommended, // JS rules
    ...ts.configs.recommended, // TS rules
    prettier, // Disable conflicting formatting rules
  ],

  files: ["src/**/*.ts"],

  languageOptions: {
    parser: ts.parser,
    parserOptions: {
      project: "./tsconfig.json",
    },
  },

  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
  },
});
