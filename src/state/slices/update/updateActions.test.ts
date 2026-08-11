import { applySWUpdate } from "serviceWorkerRegistration";
import { store, updateSlice } from "state";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyUpdate } from "./updateActions";

vi.mock("serviceWorkerRegistration", () => {
	return { applySWUpdate: vi.fn() };
});

const getUpdateAvailable = () => store.state.update.updateAvailable;

describe("applyUpdate", () => {
	let reloadSpy: ReturnType<typeof vi.spyOn> | null = null;

	beforeEach(() => {
		vi.mocked(applySWUpdate).mockReset();
		updateSlice("update", (update) => {
			update.updateAvailable = true;
		});

		try {
			reloadSpy = vi.spyOn(window.location, "reload").mockImplementation(() => {});
		} catch {
			reloadSpy = null;
		}
	});

	afterEach(() => {
		reloadSpy?.mockRestore();
		reloadSpy = null;
	});

	it("returns false and does not reload when no update is applied", () => {
		vi.mocked(applySWUpdate).mockReturnValue(false);

		expect(applyUpdate()).toBe(false);
		if (reloadSpy) {
			expect(reloadSpy).not.toHaveBeenCalled();
		}
		expect(getUpdateAvailable()).toBe(true);
	});

	it("returns true and reloads when applied", () => {
		vi.mocked(applySWUpdate).mockReturnValue(true);

		expect(applyUpdate()).toBe(true);
		if (reloadSpy) {
			expect(reloadSpy).toHaveBeenCalledTimes(1);
		}
		expect(getUpdateAvailable()).toBe(true);
	});
});
