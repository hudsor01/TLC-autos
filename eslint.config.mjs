import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Strip eslint-plugin-react configs — incompatible with ESLint 10.
// Keep react-hooks and jsx-a11y (they work fine).
function stripReactPlugin(configs) {
  return configs
    .map((config) => {
      if (!config) return config;
      const cleaned = { ...config };

      // Remove react plugin registration
      if (cleaned.plugins?.react) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { react: _, ...rest } = cleaned.plugins;
        cleaned.plugins = rest;
      }

      // Remove react/* rules
      if (cleaned.rules) {
        cleaned.rules = Object.fromEntries(
          Object.entries(cleaned.rules).filter(
            ([key]) => !key.startsWith("react/")
          )
        );
      }

      return cleaned;
    })
    .filter(Boolean);
}

const eslintConfig = defineConfig([
  ...stripReactPlugin(nextVitals),
  ...stripReactPlugin(nextTs),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
