import { DeepKeyofPaths } from "lib/type-assertions";
import { get } from "lib/type-guards";

import { parseEnv, setGlobalValue } from "./utils";

/**
 * Environment variables.
 *
 * Add all environment variables here to ensure type safety.
 */
export const env = Object.freeze({
	// Core
	appName: "Music Library", // Optionally use `import.meta.env.REACT_APP_NAME`
	appVersion: import.meta.env.REACT_APP_VERSION,
	gitBranch: import.meta.env.REACT_APP_GIT_BRANCH,
	gitCommitHash: import.meta.env.REACT_APP_GIT_COMMIT,
	showDevTools:
		import.meta.env.MODE === "development" &&
		parseEnv(import.meta.env.REACT_APP_SHOW_DEVTOOLS),
	mode: import.meta.env.MODE,
	isDev: import.meta.env.MODE === "development",
	isProd: import.meta.env.MODE === "production",
	isTest: import.meta.env.MODE === "test",
	isStage: import.meta.env.MODE === "stage" || import.meta.env.MODE === "staging",
	// Features
	bugcatch: parseEnv(import.meta.env.REACT_APP_BUGCATCH_ENABLE)
});

/**
 * Resolve value from env object.
 *
 * Supports resolving values nested in objects.
 *
 * @example envGet("plausible.enable") -> true
 */
export const envGet = (key: EnvKeys) => {
	return get(env, key);
};

export type EnvObj = typeof env;
export type EnvKeys = DeepKeyofPaths<EnvObj>;

export const injectEnv = () => {
	setGlobalValue("env", env);
	setGlobalValue("envGet", envGet);
};
