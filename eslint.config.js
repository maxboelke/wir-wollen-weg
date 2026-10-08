// ESLint flat config (tech-stack.md §2.5).
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Full type-checked strict rules for our TypeScript sources.
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },
  // jsx-a11y: eslint-config-next registers the plugin with a few rules; enable the full
  // recommended set (plugin already registered, so only the rules are merged in).
  {
    files: ["**/*.tsx"],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // UI texts belong in messages/*.json (tech-stack.md §2.5, PRD i18n risk).
      "react/jsx-no-literals": ["error", { noStrings: false, ignoreProps: true }],
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
    "next-env.d.ts",
    "docs/**",
  ]),
]);
