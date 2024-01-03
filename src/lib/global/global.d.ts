import type { FeatureFlags, FeatureOptions } from "./featureFlags";
import type { LogStoreType } from "./log";

type LogFunction = (logLevel: any, ...args: any[]) => void;
type FeatureFunction = (mode: FeatureFlags, options?: FeatureOptions) => boolean;

declare global {
	var log: LogFunction;
	var debug: LogFunction;
	var logStore: LogStoreType;
	var feature: FeatureFunction;
	var appName: string;
	var appVersion: any;
	var gitBranch: any;
	var gitCommitHash: any;
	var environment: string;
	var getNumberOfEventListeners: () => number;
	var getObjectOfEventListeners: () => Record<string, number>;

	interface Window {
		log: LogFunction;
		debug: LogFunction;
		logStore: LogStoreType;
		feature: FeatureFunction;
		appName: string;
		appVersion: any;
		gitBranch: any;
		gitCommitHash: any;
		environment: string;
		getNumberOfEventListeners: () => number;
		getObjectOfEventListeners: () => Record<string, number>;
	}
}
