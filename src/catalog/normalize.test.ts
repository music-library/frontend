import { describe, expect, test } from "vitest";

import { catalogStorageId, normalizeLibrarySnapshot } from "./normalize";
import { apiSnapshot, apiTrack } from "./testData";

describe("normalizeLibrarySnapshot", () => {
	test("creates library-scoped stable keys and flattened track records", () => {
		const result = normalizeLibrarySnapshot("main", apiSnapshot());

		expect(catalogStorageId("main", "track-a")).toBe("main:track-a");
		expect(result.tracks[0]).toMatchObject({
			storageId: "main:track-a",
			libraryId: "main",
			id: "track-a",
			albumId: "album-a",
			order: 0,
			title: "Title track-a",
			albumTitle: "Album album-a",
			timesPlayed: 0,
			lastPlayed: -1
		});
	});

	test("constructs albums in API track order with the album map's first track as cover", () => {
		const tracks = [
			apiTrack("b-1", "album-b"),
			apiTrack("a-2", "album-a", { metadata: { track: 2 } }),
			apiTrack("a-1", "album-a", { metadata: { track: 1 } })
		];
		const result = normalizeLibrarySnapshot(
			"main",
			apiSnapshot(tracks, {
				"album-a": ["a-1", "a-2"],
				"album-b": ["b-1"]
			})
		);

		expect(result.tracks.map((track) => track.id)).toEqual(["b-1", "a-2", "a-1"]);
		expect(result.albums.map(({ id, order, coverTrackId }) => ({ id, order, coverTrackId }))).toEqual([
			{ id: "album-b", order: 0, coverTrackId: "b-1" },
			{ id: "album-a", order: 1, coverTrackId: "a-1" }
		]);
	});

	test.each([
		["missing tracks", { tracks: null }],
		["missing album reference", { albums: { "album-a": ["missing"] } }],
		["mismatched track map", { tracks_map: { "track-a": 2 } }],
		["duplicate track IDs", {
			tracks: [apiTrack("track-a", "album-a"), apiTrack("track-a", "album-a")],
			tracks_map: { "track-a": 0 }
		}],
		["invalid stats", {
			tracks: [apiTrack("track-a", "album-a", { stats: { timesPlayed: Number.NaN } })]
		}]
	])("rejects a malformed snapshot: %s", (_name, patch) => {
		const snapshot = { ...apiSnapshot(), ...patch };
		expect(() => normalizeLibrarySnapshot("main", snapshot as never)).toThrow();
	});
});
