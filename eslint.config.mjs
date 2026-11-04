import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Editor previews intentionally render local blob/data URLs that cannot
      // go through the Next image optimizer.
      "@next/next/no-img-element": "off",
      // Product prose contains ordinary apostrophes and quoted UI labels;
      // escaping them does not improve correctness or accessibility.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["mobile/**/*.{ts,tsx}"],
    rules: {
      // React Native/Expo files are not Next.js routes or DOM components.
      "@next/next/no-assign-module-variable": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      // PanResponder instances intentionally expose their stable handler refs
      // during render, which the generic React DOM rule misclassifies.
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "mobile/dist/**",
    "mobile/public/ffmpeg/**",
    "src/components/VideoEditor.old.tsx",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
