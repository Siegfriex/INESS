module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*",
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "no-unused-vars": "off",
  },
};