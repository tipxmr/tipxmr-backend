module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "typescript-sort-keys"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:typescript-sort-keys/recommended"],
};
