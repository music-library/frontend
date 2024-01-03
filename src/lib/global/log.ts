import dayjs from "dayjs";

import { $global } from "./utils";
import { padChar } from "lib/strings";

// @TODO:
// export interface Logger {
// 	filter(level: string, tags: string[]): boolean;
// 	format: (tags: string[], message: string, location?: string) => string;
// 	log(message: any, ...optionalParams: any[]): void;
// 	error(message: any, ...optionalParams: any[]): void;
// 	warn(message: any, ...optionalParams: any[]): void;
// 	debug(message: any, ...optionalParams: any[]): void;
// 	verbose(message: any, ...optionalParams: any[]): void;
// }

enum ConsoleFunctions {
	debug = "debug",
	error = "error",
	info = "info",
	log = "log",
	table = "table",
	trace = "trace",
	warn = "warn",
	group = "group",
	groupEnd = "groupEnd"
}

type chars = string | number;
const styles = ["color: #888"].join(";");
const timestamp = () => dayjs().format("HH:mm:ss.SSS");
const padStr = (str: chars = "", c = 5) => padChar(str, c, " ", true);

// Internal log store class. Keeps track of log times and counts per namespace.
//
// Injects into global object as `$global.logStore`.
class LogStore {
	defaultNamespace: string;
	logStore: Record<string, [number, number]>;

	constructor() {
		this.defaultNamespace = "_log";
		this.logStore = {
			_log: [Date.now(), 1]
		};
	}

	get(namespace = this.defaultNamespace) {
		return this.logStore?.[namespace];
	}

	getTime(namespace = this.defaultNamespace) {
		return this.logStore?.[namespace]?.[0] || Date.now();
	}

	getCount(namespace = this.defaultNamespace) {
		return this.logStore?.[namespace]?.[1] || 1;
	}

	set(namespace = this.defaultNamespace, time = Date.now(), count = 1) {
		return (this.logStore[namespace] = [time, count]);
	}

	increment(namespace = this.defaultNamespace) {
		return this.set(namespace, Date.now(), this.getCount(namespace) + 1);
	}
}

export type LogStoreType = LogStore;

const timestampString = (diff: chars, namespace?: string) => {
	const ts = `%c${timestamp()} +${padStr(diff)}%s`;

	if (namespace === $global.logStore.defaultNamespace) {
		return ts;
	}

	// Log Count (not being used):
	// x${padStr($global.logStore.getCount(namespace), 3)}

	return `${ts} ${padStr(namespace, 10)}`;
};

const _log = (namespace: string, logLevel: any, ...args: any[]) => {
	if (import.meta.env.MODE === "production") return;

	const timeElapsed = dayjs().diff($global.logStore.getTime(namespace), "millisecond");
	const stringToLog = timestampString(timeElapsed, namespace);
	$global.logStore.increment(namespace);

	// Special case for table. No timestamp or styles as it messes with the table.
	if (logLevel === "table") {
		return console.table(...args);
	}

	if (ConsoleFunctions[logLevel as ConsoleFunctions]) {
		console[ConsoleFunctions[logLevel as ConsoleFunctions]](
			stringToLog,
			styles,
			"",
			...args
		);
	} else {
		console.log(stringToLog, styles, "", logLevel, ...args);
	}
};

/**
 * log in development only (`NODE_ENV !== "production"`)
 *
 * Adds a timestamp and timediff to each log automatically.
 */
export const log = (logLevel: any, ...args: any[]) => {
	_log($global.logStore.defaultNamespace, logLevel, ...args);
};

/**
 * Alias for `log`, plus namespaces logs to keep them separate.
 *
 * @example debug("socket", "msg received") -> "[socket] msg recieved"
 */
export const debug = (namespace: string, logLevel: any, ...args: any[]) => {
	_log(namespace, logLevel, ...args);
};

export const injectLog = () => {
	$global.logStore = new LogStore();
	$global.log = log;
	$global.debug = debug;
};
