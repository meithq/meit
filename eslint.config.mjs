import nextConfig from "eslint-config-next/core-web-vitals.js";

export default [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
