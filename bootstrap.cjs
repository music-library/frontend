#!/usr/bin/env node
const core = require("./scripts/bootstrap/core.cjs");
const packageJSON = require("./package.json");

const pathRoot = __dirname;
const args = [...process.argv.slice(2)];

// Run bootrap
bootstrap();

// Bootstrap runs code before react start/build.
// Run anything you like, here we get the app version from the package.json + the current commit hash.
// prettier-ignore
async function bootstrap() {
	const isDev = core.isDev(args);
	const gitCommitHash = await core.run(`git rev-parse HEAD`, pathRoot, '');
	const gitCommitHashShort = core.shorten(gitCommitHash) || '';
	const gitBranch = await core.getGitBranch(pathRoot);
	const appVersion = packageJSON?.version;
	const appName = packageJSON?.name;

	// When true, the env array below can be overridden by whatever is in the environment at runtime.
	const allowEnvOverride = true;

	// Set ENV array to inject, key/value
	const env = [
		["NODE_ENV", core.getNodeEnv(args)],
		["GENERATE_SOURCEMAP", isDev],
		["REACT_APP_NAME", appName],
		["REACT_APP_VERSION", appVersion],
		["REACT_APP_GIT_BRANCH", gitBranch],
		["REACT_APP_GIT_COMMIT", gitCommitHashShort],
	];

	// Log app name and version info
	console.log(core.versionString(appName, appVersion, gitBranch, gitCommitHashShort), "\n");

	core.bootstrap(env, allowEnvOverride, args, pathRoot);
}
