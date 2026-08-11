import { afterEach, describe, expect, test } from "vitest";

import type { Catalog } from "./database";
import { initializeCatalog, reconcileCatalog } from "./database";
import { catalogStorageId } from "./normalize";
import { updateCatalogTrackStats } from "./service";
import { apiSnapshot, apiTrack } from "./testData";

const openCatalogs: Catalog[] = [];
const uniqueName = () => `catalogtest${Math.random().toString(36).slice(2)}`;
const openCatalog = async (options = {}) => {
	const instance = await initializeCatalog({ databaseName: uniqueName(), ...options });
	openCatalogs.push(instance);
	return instance;
};

afterEach(async () => {
	await Promise.all(openCatalogs.splice(0).map((catalog) => catalog.database.close()));
});

describe("catalog persistence and reconciliation", () => {
	test("hydrates TanStack collections from IndexedDB across reinitialization", async () => {
		const databaseName = uniqueName();
		const first = await initializeCatalog({ databaseName });
		expect(first.isPersistent).toBe(true);
		await reconcileCatalog(first, "main", apiSnapshot());
		await first.database.close();

		const second = await initializeCatalog({ databaseName });
		openCatalogs.push(second);

		expect(second.tracks.get(catalogStorageId("main", "track-a"))).toMatchObject({
			id: "track-a",
			libraryId: "main"
		});
	});

	test("falls back to an online-only memory catalog when requested", async () => {
		const memory = await openCatalog({ forceMemory: true });
		expect(memory.isPersistent).toBe(false);
		await reconcileCatalog(memory, "main", apiSnapshot());
		expect(await memory.rx.tracks.count().exec()).toBe(1);
	});

	test("isolates libraries, upserts changed records, and removes stale records", async () => {
		const memory = await openCatalog({ forceMemory: true });
		await reconcileCatalog(
			memory,
			"main",
			apiSnapshot(
				[apiTrack("track-a", "album-a"), apiTrack("track-b", "album-b")],
				{ "album-a": ["track-a"], "album-b": ["track-b"] }
			)
		);
		await reconcileCatalog(
			memory,
			"other",
			apiSnapshot([apiTrack("track-a", "album-a")], { "album-a": ["track-a"] })
		);
		await reconcileCatalog(
			memory,
			"main",
			apiSnapshot([
				apiTrack("track-b", "album-b", { metadata: { title: "Updated" } })
			], { "album-b": ["track-b"] })
		);

		const documents = await memory.rx.tracks.find().exec();
		expect(documents.map((document) => document.storageId).sort()).toEqual([
			"main:track-b",
			"other:track-a"
		]);
		expect(documents.find((document) => document.storageId === "main:track-b")?.title)
			.toBe("Updated");
		expect(await memory.rx.albums.count({ selector: { libraryId: "main" } }).exec())
			.toBe(1);
	});

	test("does not delete cached records when the new snapshot is invalid", async () => {
		const memory = await openCatalog({ forceMemory: true });
		await reconcileCatalog(memory, "main", apiSnapshot());

		const invalid = apiSnapshot();
		invalid.albums = { "album-a": ["missing"] };
		await expect(reconcileCatalog(memory, "main", invalid)).rejects.toThrow();

		expect(await memory.rx.tracks.count().exec()).toBe(1);
		expect(await memory.rx.albums.count().exec()).toBe(1);
	});

	test("persists optimistic play stats until the API snapshot replaces them", async () => {
		const memory = await openCatalog({ forceMemory: true });
		await reconcileCatalog(memory, "main", apiSnapshot());
		await memory.tracks.preload();

		const transaction = updateCatalogTrackStats(memory, "main", "track-a");
		expect(transaction).toBeDefined();
		await transaction?.isPersisted.promise;
		expect(memory.tracks.get("main:track-a")?.timesPlayed).toBe(1);

		await reconcileCatalog(memory, "main", apiSnapshot());
		expect((await memory.rx.tracks.findOne("main:track-a").exec())?.timesPlayed).toBe(0);
	});
});
