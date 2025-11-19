import js from "@eslint/js";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  {
    files: ["**/*.js"],

    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        window: "readonly",
        document: "readonly",
        firebase: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        console: "readonly",
        alert: "readonly",
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-undef": "off", // Firebase is global
    },
  },
];
