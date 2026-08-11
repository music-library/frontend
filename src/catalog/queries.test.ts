import { queryOnce } from "@tanstack/db";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Catalog } from "./database";
import { initializeCatalog } from "./database";
import {
	buildAlbumTracksQuery,
	buildLibraryAlbumsQuery,
	buildLibraryTracksQuery,
	buildPopularTracksQuery,
	buildRecentlyPlayedTracksQuery,
	getDistinctAlbumIds,
	getDistinctCatalogTags
} from "./hooks";
import { normalizeLibrarySnapshot } from "./normalize";
import { apiSnapshot, apiTrack } from "./testData";
import type { AlbumRecord, TrackRecord } from "./types";

let testCatalog: Catalog;

const insertAll = async <T extends TrackRecord | AlbumRecord>(
	collection: Catalog["tracks"] | Catalog["albums"],
	records: T[]
) => {
	for (const record of records) {
		const transaction = collection.insert(record as never);
		await transaction.isPersisted.promise;
	}
};

beforeEach(async () => {
	testCatalog = await initializeCatalog({
		databaseName: `querytest${Math.random().toString(36).slice(2)}`,
		forceMemory: true
	});
	const main = normalizeLibrarySnapshot(
		"main",
		apiSnapshot([
			apiTrack("track-1", "album-a", {
				metadata: { track: 2, title: "Blue Moon", genre: "Rock", decade: "1990" },
				stats: { timesPlayed: 3, lastPlayed: 100 }
			}),
			apiTrack("track-2", "album-a", {
				metadata: { track: 1, artist: "Needle Artist", genre: "Jazz", decade: "1990" },
				stats: { timesPlayed: 5, lastPlayed: 300 }
			}),
			apiTrack("track-3", "album-b", {
				metadata: { track: 1, year: "2004", decade: "2000", genre: "Rock" },
				stats: { timesPlayed: 1, lastPlayed: 200 }
			})
		], {
			"album-b": ["track-3"],
			"album-a": ["track-1", "track-2"]
		})
	);
	const other = normalizeLibrarySnapshot(
		"other",
		apiSnapshot([apiTrack("track-1", "album-a")], { "album-a": ["track-1"] })
	);

	await insertAll(testCatalog.tracks, [...main.tracks, ...other.tracks]);
	await insertAll(testCatalog.albums, [...main.albums, ...other.albums]);
});

afterEach(async () => {
	await testCatalog.database.close();
});

describe("catalog query builders", () => {
	test("scopes tracks and albums to a library while preserving API order", async () => {
		const tracks = await queryOnce((q) =>
			buildLibraryTracksQuery(q, testCatalog.tracks, "main")
		) as TrackRecord[];
		const albums = await queryOnce((q) =>
			buildLibraryAlbumsQuery(q, testCatalog.albums, "main")
		) as AlbumRecord[];

		expect(tracks.map((track) => track.id)).toEqual(["track-1", "track-2", "track-3"]);
		expect(albums.map((album) => album.id)).toEqual(["album-a", "album-b"]);
	});

	test("orders album membership by track number and then API order", async () => {
		const tracks = await queryOnce((q) =>
			buildAlbumTracksQuery(q, testCatalog.tracks, "main", "album-a")
		) as TrackRecord[];
		expect(tracks.map((track) => track.id)).toEqual(["track-2", "track-1"]);
	});

	test("combines OR-within-category tags with AND-between-category tags", async () => {
		const rockNineties = await queryOnce((q) =>
			buildLibraryTracksQuery(q, testCatalog.tracks, "main", {
				tags: ["Rock", "1990"]
			})
		) as TrackRecord[];
		const eitherGenreNineties = await queryOnce((q) =>
			buildLibraryTracksQuery(q, testCatalog.tracks, "main", {
				tags: ["Rock", "Jazz", "1990"]
			})
		) as TrackRecord[];

		expect(rockNineties.map((track) => track.id)).toEqual(["track-1"]);
		expect(eitherGenreNineties.map((track) => track.id)).toEqual(["track-1", "track-2"]);
	});

	test("performs case-insensitive substring search across metadata fields", async () => {
		const tracks = await queryOnce((q) =>
			buildLibraryTracksQuery(q, testCatalog.tracks, "main", {
				search: "NEEDLE",
				includeSearch: true
			})
		) as TrackRecord[];
		expect(tracks.map((track) => track.id)).toEqual(["track-2"]);
	});

	test("returns distinct tags and album IDs", async () => {
		const tracks = await queryOnce((q) =>
			buildLibraryTracksQuery(q, testCatalog.tracks, "main")
		) as TrackRecord[];
		expect(getDistinctCatalogTags(tracks)).toEqual({
			genres: ["Jazz", "Rock"],
			decades: ["1990", "2000"]
		});
		expect(getDistinctAlbumIds(tracks)).toEqual(["album-a", "album-b"]);
	});

	test("orders and limits popular and recently played tracks", async () => {
		const warning = vi.spyOn(console, "warn");
		const popular = await queryOnce((q) =>
			buildPopularTracksQuery(q, testCatalog.tracks, "main", 2)
		) as TrackRecord[];
		const recent = await queryOnce((q) =>
			buildRecentlyPlayedTracksQuery(q, testCatalog.tracks, "main", 2)
		) as TrackRecord[];

		expect(popular.map((track) => track.id)).toEqual(["track-2", "track-1"]);
		expect(recent.map((track) => track.id)).toEqual(["track-2", "track-3"]);
		expect(warning).not.toHaveBeenCalledWith(
			expect.stringContaining("orderBy with limit requires an index")
		);
		warning.mockRestore();
	});
});
