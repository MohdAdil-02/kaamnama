import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    setupFiles: ["./tests/setup.js"],
    testTimeout: 30000,
    hookTimeout: 120000,
    // One file at a time: every file shares one in-memory database
    fileParallelism: false,
  },
});