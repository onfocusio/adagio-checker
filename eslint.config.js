const globals = require("globals");
const pluginJs = require("@eslint/js");
const babelParser = require("@babel/eslint-parser");

module.exports = [
  {
    ignores: ["eslint.config.js", "dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.js"],
    rules: {
      "no-unused-vars": "warn",
      "no-use-before-define": ["error", {
        "functions": false,
        "classes": true
      }],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-trailing-spaces": "error",
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2018,
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        "ADAGIO": "readonly",
        "ADAGIO_KEY": "readonly",
      },
    },
  },
  pluginJs.configs.recommended,
];
