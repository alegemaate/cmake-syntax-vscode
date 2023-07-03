module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "prettier",
  ],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/ban-types": "warn",
    "@typescript-eslint/explicit-member-accessibility": "warn",
    "@typescript-eslint/sort-type-constituents": "warn",
    "@typescript-eslint/method-signature-style": "warn",
    "@typescript-eslint/no-shadow": "warn",
    "@typescript-eslint/promise-function-async": "warn",
    "@typescript-eslint/prefer-readonly": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    "arrow-body-style": "warn",
    "func-style": ["warn", "expression"],
    "no-else-return": "warn",
  },
  ignorePatterns: ["node_modules", "dist", ".eslintrc.js"],
};
