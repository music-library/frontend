import { beforeEach, describe, expect, test, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
	get: vi.fn()
}));

vi.mock("lib/api", () => ({
	api: vi.fn(() => ({ get: apiMocks.get }))
}));

import {
	catalog,
	getCatalogRefreshState,
	reconcileLibrary,
	refreshLibrary
} from "./database";
import { apiSnapshot, apiTrack } from "./testData";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("cached-first catalog refresh", () => {
	test("renders the cached record while a background snapshot is pending", async () => {
		const libraryId = `cached${Math.random().toString(36).slice(2)}`;
		await reconcileLibrary(libraryId, apiSnapshot());
		await catalog.tracks.preload();

		let resolveRequest;
		apiMocks.get.mockReturnValue(new Promise((resolve) => {
			resolveRequest = resolve;
		}));
		const refreshing = refreshLibrary(libraryId);

		expect(catalog.tracks.get(`${libraryId}:track-a`)?.title).toBe("Title track-a");
		expect(getCatalogRefreshState(libraryId).isRefreshing).toBe(true);

		resolveRequest({
			data: apiSnapshot([
				apiTrack("track-a", "album-a", { metadata: { title: "Fresh title" } })
			])
		});
		await refreshing;
		expect((await catalog.rx.tracks.findOne(`${libraryId}:track-a`).exec())?.title)
			.toBe("Fresh title");
	});

	test("keeps cached data when the network refresh fails", async () => {
		const libraryId = `failure${Math.random().toString(36).slice(2)}`;
		await reconcileLibrary(libraryId, apiSnapshot());
		apiMocks.get.mockRejectedValue(new Error("offline"));

		await refreshLibrary(libraryId);

		expect(await catalog.rx.tracks.findOne(`${libraryId}:track-a`).exec()).not.toBeNull();
		expect(getCatalogRefreshState(libraryId)).toMatchObject({
			isRefreshing: false,
			didError: true,
			hasAttempted: true
		});
	});

	test("reports an error without inventing data for an uncached library", async () => {
		const libraryId = `uncached${Math.random().toString(36).slice(2)}`;
		apiMocks.get.mockRejectedValue(new Error("offline"));

		await refreshLibrary(libraryId);

		expect(await catalog.rx.tracks.count({ selector: { libraryId } }).exec()).toBe(0);
		expect(getCatalogRefreshState(libraryId).didError).toBe(true);
	});

	test("retains multiple cached libraries for offline switching", async () => {
		const suffix = Math.random().toString(36).slice(2);
		const firstLibrary = `first${suffix}`;
		const secondLibrary = `second${suffix}`;
		await reconcileLibrary(firstLibrary, apiSnapshot());
		await reconcileLibrary(secondLibrary, apiSnapshot());

		expect(await catalog.rx.tracks.count({ selector: { libraryId: firstLibrary } }).exec())
			.toBe(1);
		expect(await catalog.rx.tracks.count({ selector: { libraryId: secondLibrary } }).exec())
			.toBe(1);
	});
});
