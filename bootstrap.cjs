#!/usr/bin/env node
const core = require("./scripts/bootstrap/core.cjs");
const packageJSON = require("./package.json");

const path = __dirname;
const args = process.argv.slice(2);

// Run bootrap
bootstrap();

// Bootstrap runs code before react start/build.
// Run anything you like, here we get the app version from the package.json + the current commit hash.
// prettier-ignore
async function bootstrap() {
	const gitCommitHash = await core.run(`git rev-parse HEAD`, path, null);
	const gitCommitHashShort = gitCommitHash ? core.shorten(gitCommitHash) : null;
	const gitBranch = await core.getGitBranch(path);
	const appVersion = packageJSON?.version;
	const appName = packageJSON?.name;

	// When true, the env array below can be overridden by whatever is in the environment at runtime.
	const allowEnvOverride = true;

	// Set ENV array to inject, key/value
	const env = [
		["NODE_ENV", "development"],
		["GENERATE_SOURCEMAP", false],
		["REACT_APP_NAME", appName],
		["REACT_APP_VERSION", appVersion],
		["REACT_APP_GIT_BRANCH", gitBranch],
		["REACT_APP_GIT_COMMIT", gitCommitHashShort],
	];

	const isProd = args.length >= 2 && (args[1] === "build" || args[1] === "preview");
	if (isProd) env[0][1] = "production";

	const isTest = args.length >= 1 && args[0] === "vitest";
	if (isTest) env[0][1] = "test";

	core.bootstrap(env, allowEnvOverride, args, path);
}
