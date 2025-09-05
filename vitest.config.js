import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		setupFiles: "./tests/setup/setupTests.js",
		globals: true,
		verbose: true,
	},
});
