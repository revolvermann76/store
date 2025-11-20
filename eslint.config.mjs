import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import tsdoc from "eslint-plugin-tsdoc";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, tsdoc },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    // env: {
    //   jest: true,
    // },
    rules: {
      "tsdoc/syntax": "warn",
    },
  },
  tseslint.configs.recommended,
]);
