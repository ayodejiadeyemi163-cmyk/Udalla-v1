import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "freebuff-sites-build/**",
    "node_modules/**",
    "next-env.d.ts",
    "coverage/**",
    "freebuff.open-next.config.ts",
    "freebuff.wrangler.jsonc",
  ]),
]);
