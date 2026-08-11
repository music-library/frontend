/**
 * State tracking for service worker (app) updates.
 *
 * SW registration and handling: `src/serviceWorkerRegistration.ts`
 */
export interface IUpdateStore {
	/** When true, an app update is available. Use `applyUpdate` action to apply. */
	updateAvailable: boolean;
	/** The service worker registration object */
	registration: ServiceWorkerRegistration | null;
}

export const updateStore: IUpdateStore = {
	updateAvailable: false,
	registration: null
};

export default updateStore;
