import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const nextConfigs = compat.extends("next/core-web-vitals", "next/typescript").map((config) => ({
  ...config,
  files: ["apps/web/**/*.{js,jsx,ts,tsx}"]
}));

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextConfigs,
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
      "packages/database/generated/**"
    ]
  }
];
