import { beforeEach, describe, expect, test, vi } from "vitest";

const getInitialVolume = async (isMobile = false) => {
	vi.doMock("react-device-detect", () => ({ isMobile }));

	const { default: sessionReducer } = await import("./sessionReducer");
	const state = sessionReducer(undefined, { type: "@@INIT" });

	return state.playing.status.volume;
};

describe("session volume initialization", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.resetModules();
	});

	test("preserves a saved volume of zero", async () => {
		localStorage.setItem("volume", "0");

		expect(await getInitialVolume()).toBe(0);
	});

	test("preserves a saved nonzero volume", async () => {
		localStorage.setItem("volume", "75");

		expect(await getInitialVolume()).toBe(75);
	});

	test("defaults to 50 when no volume is saved", async () => {
		expect(await getInitialVolume()).toBe(50);
	});

	test("defaults to 100 on mobile", async () => {
		localStorage.setItem("volume", "75");

		expect(await getInitialVolume(true)).toBe(100);
	});
});
