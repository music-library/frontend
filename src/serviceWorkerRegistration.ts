import { store, updateSlice } from "state";

// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

type ServiceWorkerConfig = {
	onUpdate?: (registration: ServiceWorkerRegistration) => void;
	onSuccess?: (registration: ServiceWorkerRegistration) => void;
};

export type ServiceWorkerUpdateState = {
	updateAvailable: boolean;
	registration: ServiceWorkerRegistration | null;
};

const notifyUpdateState = (next: Partial<ServiceWorkerUpdateState>) => {
	updateSlice("update", (update) => {
		update.updateAvailable = next.updateAvailable ?? false;
		update.registration = next.registration ?? null;
	});
};

const markUpdateAvailable = (registration: ServiceWorkerRegistration) => {
	notifyUpdateState({ updateAvailable: true, registration });
};

const setRegistration = (registration: ServiceWorkerRegistration) => {
	notifyUpdateState({ registration });
	if (registration.waiting && navigator.serviceWorker.controller) {
		markUpdateAvailable(registration);
	}
};

/**
 * Ask the waiting service worker to activate immediately.
 */
export const applySWUpdate = () => {
	const registration = store.state.update.registration;
	if (!registration?.waiting) {
		return false;
	}

	registration.waiting.postMessage({ type: "SKIP_WAITING" });
	return true;
};

/**
 * Force the browser to check for a newer service worker.
 */
export const checkForSWUpdate = async () => {
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
		return false;
	}

	const registration =
		store.state.update.registration ??
		(await navigator.serviceWorker.getRegistration());
	if (!registration) {
		return false;
	}

	await registration.update();
	return true;
};

/**
 * Test-only helpers for manipulating update state.
 */
export const __testing = {
	setUpdateState: (next: Partial<ServiceWorkerUpdateState>) => {
		notifyUpdateState(next);
	},
	resetUpdateState: () => {
		notifyUpdateState({ updateAvailable: false, registration: null });
	}
};

let controllerListenerAttached = false;

const isLocalhost = Boolean(
	window.location.hostname === "localhost" ||
	// [::1] is the IPv6 localhost address.
	window.location.hostname === "[::1]" ||
	// 127.0.0.0/8 are considered localhost for IPv4.
	window.location.hostname.match(
		/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
	)
);

/**
 * Register the service worker and wire update callbacks if provided.
 */
export function register(config?: ServiceWorkerConfig) {
	if (import.meta.env.MODE === "production" && "serviceWorker" in navigator) {
		if (!controllerListenerAttached) {
			navigator.serviceWorker.addEventListener("controllerchange", () => {
				notifyUpdateState({ updateAvailable: false });
			});
			controllerListenerAttached = true;
		}

		// The URL constructor is available in all browsers that support SW.
		const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
		if (publicUrl.origin !== window.location.origin) {
			// Our service worker won't work if PUBLIC_URL is on a different origin
			// from what our page is served on. This might happen if a CDN is used to
			// serve assets; see https://github.com/facebook/create-react-app/issues/2374
			return;
		}

		window.addEventListener("load", () => {
			const swUrl = `${import.meta.env.BASE_URL}sw.js`;

			if (isLocalhost) {
				// This is running on localhost. Let's check if a service worker still exists or not.
				checkValidSW(swUrl, config);

				// Add some additional logging to localhost, pointing developers to the
				// service worker/PWA documentation.
				navigator.serviceWorker.ready.then(() => {
					// console.log(
					// 	"This web app is being served cache-first by a service " +
					// 		"worker. To learn more, visit https://cra.link/PWA"
					// );
				});
			} else {
				// Is not localhost. Just register service worker
				registerValidSW(swUrl, config);
			}
		});
	}
}

function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
	navigator.serviceWorker
		.register(swUrl)
		.then((registration) => {
			setRegistration(registration);
			registration.onupdatefound = () => {
				const installingWorker = registration.installing;
				if (installingWorker == null) return;

				installingWorker.onstatechange = () => {
					if (installingWorker.state === "installed") {
						if (navigator.serviceWorker.controller) {
							markUpdateAvailable(registration);
							// At this point, the updated precached content has been fetched,
							// but the previous service worker will still serve the older
							// content until all client tabs are closed.
							logn(
								"serviceWorker",
								"New content is available and will be used when all " +
									"tabs for this page are closed. See https://cra.link/PWA."
							);

							// Execute callback
							if (config && config.onUpdate) {
								config.onUpdate(registration);
							}
						} else {
							// At this point, everything has been precached
							logn("serviceWorker", "Content is cached for offline use.");

							// Execute callback
							if (config && config.onSuccess) {
								config.onSuccess(registration);
							}
						}
					}
				};
			};
		})
		.catch((error) => {
			logn.error(
				"serviceWorker",
				"Error during service worker registration:",
				error
			);
		});
}

function checkValidSW(swUrl: string, config?: ServiceWorkerConfig) {
	// Check if the service worker can be found. If it can't reload the page.
	fetch(swUrl, {
		headers: { "Service-Worker": "script" }
	})
		.then((response) => {
			// Ensure service worker exists, and that we really are getting a JS file.
			const contentType = response.headers.get("content-type");
			if (
				response.status === 404 ||
				(contentType != null && contentType.indexOf("javascript") === -1)
			) {
				// No service worker found. Probably a different app. Reload the page.
				navigator.serviceWorker.ready.then((registration) => {
					registration.unregister().then(() => {
						window.location.reload();
					});
				});
			} else {
				// Service worker found. Proceed as normal.
				registerValidSW(swUrl, config);
			}
		})
		.catch(() => {
			logn.warn(
				"serviceWorker",
				"No internet connection found. App is running in offline mode."
			);
		});
}

/**
 * Unregister any active service worker.
 */
export function unregister() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.ready
			.then((registration) => {
				registration.unregister();
			})
			.catch((error) => {
				logn.error("serviceWorker", error.message);
			});
	}
}
