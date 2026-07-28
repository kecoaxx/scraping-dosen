import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    rules: {
      "no-undef": "off",
    },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  {
    ignores: ["src/scrapers/0.scraper-template.js"], // ignore scraper template
  },
]);
