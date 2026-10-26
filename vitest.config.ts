import { defineConfig } from "vitest/config";
import path from "node:path";

// Mirrors the "@/..." path alias from tsconfig.json so modules under src/lib
// can import each other the same way the app code does.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
