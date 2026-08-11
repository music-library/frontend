import { applySWUpdate } from "serviceWorkerRegistration";

/**
 * Apply the waiting service worker update and reload the page.
 *
 * @warning This will reload the entire app!
 */
export const applyUpdate = () => {
	const applied = applySWUpdate();
	if (!applied) {
		return false;
	}

	if (typeof window !== "undefined") {
		window.location.reload();
	}

	return true;
};
