import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/", ".gitnexus/", "node_modules/", "out/", "build/"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  }
);
