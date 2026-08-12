import { applySWUpdate } from "serviceWorkerRegistration";

import { useSelector } from "lib/hooks";

/**
 * Apply the waiting service worker update and reload the page.
 *
 * @warning This will reload the entire app!
 */
export const applyUpdate = (shouldReload = true) => {
	const applied = applySWUpdate();
	if (!applied) {
		return false;
	}

	if (shouldReload && typeof window !== "undefined") {
		window.location.reload();
	}

	return true;
};

export const useUpdateAvailable = () => {
	return useSelector((state) => state.update.updateAvailable);
};
