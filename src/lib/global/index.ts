/**
 * JS to execute before ANY react code or component is rendered.
 *
 * Used to setup global functions and variables to be used throughout the app.
 *
 * @Warning - Do NOT import from any file in global from outside global. You can however import into global.
 * ✓ global <-- utils
 * ✗ global --> utils
 * ✗ import "globalInit" from "global";
 *
 * @Warning - Since the window object is exposed, don't put anything remotely sensitive in here.
 */
import { injectDevTools } from "./devTools";
import { injectFeature } from "./featureFlags";
import { injectLog } from "./log";
import { injectVersion, versionString } from "./version";

export const globalInit = () => {
	if (import.meta.env.MODE !== "test")
		console.log(`%c${versionString()}`, "font-size: 1.1em;");

	// Inject global functions.
	injectLog();
	injectFeature();
	injectVersion();
	if (import.meta.env.MODE !== "production") injectDevTools();
};

globalInit();
export default globalInit;
