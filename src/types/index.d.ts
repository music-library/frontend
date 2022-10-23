export {};

type LogFunction = (logLevel: any, ...args: any[]) => void;

declare global {
	const log: LogFunction;
	const debug: LogFunction;

	interface Window {
		log: LogFunction;
		debug: LogFunction;
		lastDebugTimestamp: number;
	}
}
