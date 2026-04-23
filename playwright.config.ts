import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: [["html"]],
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "pnpm preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
