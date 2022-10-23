// @ts-nocheck
const util = require("util");
const exec = require("child_process").exec;
const execAwait = util.promisify(exec);

/**
 * Validate args
 * @note CURRENTLY NOT IN USE
 */
function getArgScript() {
	// CLI args
	const args = process.argv.slice(2);

	// Bootstap commands (react-start build | start | test)
	const scriptIndex = args.findIndex(
		(x) => x === "build" || x === "start" || x === "test"
	);
	let script = scriptIndex === -1 ? args[0] : args[scriptIndex];

	if (scriptIndex === -1) {
		script = "build";
		console.warn("WARN: Invalid command (expects build | start | test)");
		console.warn('WARN: Falling back to "build" command');
		console.warn("");
	}

	return [script, args.slice(1)];
}

/**
 * Bootstrap runs code before react start/build.
 *
 * Injects ENV array into cross-env before running script
 */
async function bootstrap(env, allowEnvOverride, args, path) {
	try {
		// Build ENV + Arguments string
		const envArr = allowEnvOverride ? overrideHardcodedENV(env) : env;
		const envString = buildENV(envArr);
		const argString = args?.length > 0 ? args.join(" ") : "";

		// Run scripts/start|build command
		runStream(
			`npx cross-env ${envString} ${argString}`,
			path
		);
	} catch (error) {
		console.error("[bootstrap]", error);
	}
}

/**
 * Shortens a string at both ends, separated by '...', eg '123456789' -> '12345...789'
 */
function shorten(str, numCharsStart = 6, numCharsEnd = 4) {
	if (str?.length <= 11) return str;
	return `${str.substring(0, numCharsStart)}...${str.slice(
		str.length - numCharsEnd
	)}`;
}

/**
 * Returns the current git branch
 */
async function getGitBranch(path, fallback = undefined) {
	let gitBranch = await run(`git rev-parse --abbrev-ref HEAD`, path, null);

	// Detect CircleCI
	if (process.env.CIRCLE_BRANCH) {
		gitBranch = process.env.CIRCLE_BRANCH;
	}

	// Detect GitHub Actions CI
	// prettier-ignore
	if (process.env.GITHUB_REF_NAME && process.env.GITHUB_REF_TYPE === "branch") {
		gitBranch = process.env.GITHUB_REF_NAME;
	}

	// Detect GitLab CI
	if (process.env.CI_COMMIT_BRANCH) {
		gitBranch = process.env.CI_COMMIT_BRANCH;
	}

	// Detect Netlify CI + generic
	if (process.env.BRANCH) {
		gitBranch = process.env.BRANCH;
	}

	// Detect HEAD state, and remove it.
	if (gitBranch === "HEAD") {
		gitBranch = fallback;
	}

	return gitBranch;
}

/**
 * Use ENV values in current environment over hardcoded values
 */
function overrideHardcodedENV(env = []) {
	let overrideCount = 0;

	const newEnv = env.map((envItem) => {
		const [name, value] = envItem;
		const envValue = process.env[name];

		if (envValue && envValue !== `${value}`) {
			console.warn(
				`WARN: Overriding hardcoded ${name} value: ${value} => ${envValue}`
			);
			overrideCount++;
			return [name, envValue];
		}

		return envItem;
	});

	if (overrideCount > 0) console.warn("");

	return newEnv;
}

/**
 * Handles ENV array and build a string to use
 */
function buildENV(env = []) {
	if (env.length < 1) return "";

	console.log("Building ENV to inject:");

	// Build ENV string
	let envString = "";
	env.forEach((item, index) => {
		if (index > 0) envString += ` `;
		const envPair = `${item[0]}=${item[1]}`;
		envString += envPair;
		console.log("  ", index + 1, envPair);
	});

	console.log("");

	return envString;
}

/**
 * Execute OS commands, awaits response from stdout
 */
async function run(command, path = __dirname, fallback = undefined) {
	try {
		const { stdout, stderr } = await execAwait(command, { cwd: path });
		return stdout?.trim();
	} catch (e) {
		if (fallback === undefined) {
			// Should contain code (exit code) and signal (that caused the termination).
			console.error("[run]", e);
		} else {
			console.log("[run] (using fallback)", e);
			return fallback;
		}
	}
}

/**
 * Execute OS commands, streams response from stdout
 */
function runStream(command, path = __dirname) {
	const execProcess = exec(command, { cwd: path });

	execProcess.stdout.pipe(process.stdout);
	execProcess.stderr.pipe(process.stderr);

	process.on("exit", (code) => {
		// console.log(
		// 	"[runStream] Child process exited with code " + code.toString()
		// );

		if (code !== 0) {
			console.log("ERROR, process finished with a non-zero code");
			process.exit(1);
		}
	});
}

module.exports = {
	bootstrap,
	buildENV,
	getArgScript,
	getGitBranch,
	overrideHardcodedENV,
	run,
	runStream,
	shorten
};
