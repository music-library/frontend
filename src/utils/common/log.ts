import dayjs from "dayjs";

import { padChar } from "./strings";

enum ConsoleFunctions {
	debug = "debug",
	error = "error",
	info = "info",
	log = "log",
	trace = "trace",
	warn = "warn"
}

type chars = string | number;
const styles = ["color: #888"].join(";");
const padStr = (str: chars) => padChar(str, 5, " ", true);
const timestamp = () => dayjs().format("HH:mm:ss.SSS");
const timestampString = (diff: chars) => `%c${timestamp()} +${padStr(diff)}%s`;
const getConsoleFunction = (level: ConsoleFunctions) => ConsoleFunctions[level];

/**
 * log
 *
 * Alias for console.log
 */
export const log = (logLevel: any, ...args: any[]) => {
	if (getConsoleFunction(logLevel)) {
		console[getConsoleFunction(logLevel)](...args);
	} else {
		console.log(logLevel, ...args);
	}
};

/**
 * log in development only (`NODE_ENV !== "production"`)
 *
 * Adds a timestamp and timediff to each log automatically
 */
export const debug = (logLevel: any, ...args: any[]) => {
	if (import.meta.env.MODE === "production") return;

	const timeElapsed = dayjs().diff(window.lastDebugTimestamp, "millisecond");

	if (getConsoleFunction(logLevel)) {
		console[getConsoleFunction(logLevel)](
			timestampString(timeElapsed),
			styles,
			"",
			...args
		);
	} else {
		console.log(
			timestampString(timeElapsed),
			styles,
			"",
			logLevel,
			...args
		);
	}

	window.lastDebugTimestamp = Date.now();
};

/**
 * Inject custom log functions to window object
 */
export const injectGlobalLog = () => {
	window.log = log;
	window.debug = debug;
	window.lastDebugTimestamp = Date.now();
};
