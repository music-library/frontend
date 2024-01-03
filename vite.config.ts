// @ts-nocheck
import react from "@vitejs/plugin-react";
import { injectManifest } from "rollup-plugin-workbox";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import linaria from "./config/linaria-rollup";

const isDev = process.env.NODE_ENV !== "production";

// https://vitejs.dev/config/
export default defineConfig({
	envPrefix: "REACT_APP_",
	build: {
		sourcemap: isDev,
		minify: true
	},
	define: {
		"process.env": {}
	},
	plugins: [
		react({
			// jsxRuntime: "classic",
			babelrc: true
		}),
		tsconfigPaths(),
		linaria({
			sourceMap: isDev,
			extension: ".scss",
			preprocessor: "none",
			exclude: ["src/global/**", "**/*.test.{js,jsx,ts,tsx}"],
			include: ["**/*.{js,jsx,ts,tsx}"]
		}),
		injectManifest({
			swDest: "dist/sw.js",
			globDirectory: "dist",
			swSrc: "src/service-worker.ts",
			maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
		})
	],
	test: {
		// https://vitest.dev/api/
		globals: false,
		environment: "happy-dom",
		setupFiles: "./src/tests/setupTests.ts",
		css: true, // @Note Parsing CSS is slow
		coverage: {
			enabled: false,
			provider: "v8"
		},
		benchmark: {
			include: ["**/*.{bench,benchmark}.?(c|m)[jt]s?(x)"],
			exclude: ["node_modules", "dist", ".idea", ".git", ".cache"]
		},
		// Debug
		logHeapUsage: true
	}
});
