import { BasicIndex } from "@tanstack/db";
import { createCollection, type Collection } from "@tanstack/react-db";
import { rxdbCollectionOptions } from "@tanstack/rxdb-db-collection";
import {
	createRxDatabase,
	type RxCollection,
	type RxDatabase,
	type RxJsonSchema
} from "rxdb/plugins/core";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";

import { api } from "lib/api";

import { normalizeLibrarySnapshot } from "./normalize";
import type {
	AlbumRecord,
	ApiLibrarySnapshot,
	CatalogRefreshState,
	LibraryRecord,
	TrackRecord
} from "./types";

type CatalogRxCollections = {
	tracks: RxCollection<TrackRecord>;
	albums: RxCollection<AlbumRecord>;
	libraries: RxCollection<LibraryRecord>;
};

type CatalogDatabase = RxDatabase<CatalogRxCollections>;

export type Catalog = {
	database: CatalogDatabase;
	rx: CatalogRxCollections;
	tracks: Collection<TrackRecord, string>;
	albums: Collection<AlbumRecord, string>;
	libraries: Collection<LibraryRecord, string>;
	isPersistent: boolean;
};

const stringProperty = { type: "string" } as const;
const numberProperty = {
	type: "number",
	minimum: -1,
	maximum: Number.MAX_SAFE_INTEGER,
	multipleOf: 1
} as const;

export const trackSchema: RxJsonSchema<TrackRecord> = {
	title: "tracks",
	version: 0,
	type: "object",
	primaryKey: "storageId",
	properties: {
		storageId: { type: "string", maxLength: 200 },
		libraryId: { type: "string", maxLength: 100 },
		id: { type: "string", maxLength: 100 },
		albumId: { type: "string", maxLength: 100 },
		order: numberProperty,
		trackNumber: numberProperty,
		title: stringProperty,
		artist: stringProperty,
		albumArtist: stringProperty,
		albumTitle: stringProperty,
		year: stringProperty,
		decade: stringProperty,
		genre: stringProperty,
		composer: stringProperty,
		duration: numberProperty,
		timesPlayed: numberProperty,
		lastPlayed: numberProperty
	},
	required: [
		"storageId", "libraryId", "id", "albumId", "order", "trackNumber",
		"title", "artist", "albumArtist", "albumTitle", "year", "decade",
		"genre", "composer", "duration", "timesPlayed", "lastPlayed"
	],
	indexes: ["libraryId", ["libraryId", "id"], ["libraryId", "order"], ["libraryId", "albumId"]]
};

export const albumSchema: RxJsonSchema<AlbumRecord> = {
	title: "albums",
	version: 0,
	type: "object",
	primaryKey: "storageId",
	properties: {
		storageId: { type: "string", maxLength: 200 },
		libraryId: { type: "string", maxLength: 100 },
		id: { type: "string", maxLength: 100 },
		order: numberProperty,
		coverTrackId: { type: "string", maxLength: 100 },
		title: stringProperty,
		artist: stringProperty,
		year: stringProperty,
		genre: stringProperty
	},
	required: [
		"storageId", "libraryId", "id", "order", "coverTrackId", "title",
		"artist", "year", "genre"
	],
	indexes: ["libraryId", ["libraryId", "id"], ["libraryId", "order"]]
};

export const librarySchema: RxJsonSchema<LibraryRecord> = {
	title: "libraries",
	version: 0,
	type: "object",
	primaryKey: "id",
	properties: {
		id: { type: "string", maxLength: 100 },
		name: stringProperty
	},
	required: ["id", "name"]
};

const addCollections = async (database: RxDatabase) => {
	await database.addCollections({
		tracks: { schema: trackSchema },
		albums: { schema: albumSchema },
		libraries: { schema: librarySchema }
	});
	return database as unknown as CatalogDatabase;
};

type CatalogInitializationOptions = {
	databaseName?: string;
	forceMemory?: boolean;
};

const createDatabase = async ({
	databaseName = "musiclibrarycatalog",
	forceMemory = false
}: CatalogInitializationOptions = {}) => {
	if (forceMemory) {
		const database = await createRxDatabase({
			name: `${databaseName}memory${Math.random().toString(36).slice(2)}`,
			storage: getRxStorageMemory(),
			multiInstance: false
		});
		return { database: await addCollections(database), isPersistent: false };
	}

	try {
		if (typeof indexedDB === "undefined") throw new Error("IndexedDB unavailable");
		const database = await createRxDatabase({
			name: databaseName,
			storage: getRxStorageDexie(),
			multiInstance: true,
			closeDuplicates: import.meta.env.MODE === "test"
		});
		return { database: await addCollections(database), isPersistent: true };
	} catch (error) {
		console.warn("[catalog] IndexedDB unavailable; using memory storage", error);
		const database = await createRxDatabase({
			name: `${databaseName}memory${Math.random().toString(36).slice(2)}`,
			storage: getRxStorageMemory(),
			multiInstance: false
		});
		return { database: await addCollections(database), isPersistent: false };
	}
};

export const initializeCatalog = async (
	options: CatalogInitializationOptions = {}
): Promise<Catalog> => {
	const { database, isPersistent } = await createDatabase(options);
	const collectionId = `${options.databaseName || "catalog"}-${Math.random().toString(36).slice(2)}`;
	const tracks = createCollection<TrackRecord, string>(
		rxdbCollectionOptions<TrackRecord>({
			id: `${collectionId}-tracks`,
			rxCollection: database.tracks,
			startSync: true,
			syncBatchSize: 1000
		})
	);
	tracks.createIndex((track) => track.timesPlayed, {
		indexType: BasicIndex,
		name: "tracks-times-played"
	});
	tracks.createIndex((track) => track.lastPlayed, {
		indexType: BasicIndex,
		name: "tracks-last-played"
	});
	const albums = createCollection<AlbumRecord, string>(
		rxdbCollectionOptions<AlbumRecord>({
			id: `${collectionId}-albums`,
			rxCollection: database.albums,
			startSync: true
		})
	);
	const libraries = createCollection<LibraryRecord, string>(
		rxdbCollectionOptions<LibraryRecord>({
			id: `${collectionId}-libraries`,
			rxCollection: database.libraries,
			startSync: true
		})
	);

	await Promise.all([tracks.preload(), albums.preload(), libraries.preload()]);
	return { database, rx: database, tracks, albums, libraries, isPersistent };
};

export const catalog = await initializeCatalog();

const defaultRefreshState: CatalogRefreshState = {
	isRefreshing: false,
	didError: false,
	hasAttempted: false
};
const refreshStates = new Map<string, CatalogRefreshState>();
const refreshListeners = new Set<() => void>();
const refreshPromises = new Map<string, Promise<void>>();

const emitRefreshState = () => refreshListeners.forEach((listener) => listener());
const setRefreshState = (libraryId: string, state: CatalogRefreshState) => {
	refreshStates.set(libraryId, state);
	emitRefreshState();
};

export const subscribeCatalogRefresh = (listener: () => void) => {
	refreshListeners.add(listener);
	return () => refreshListeners.delete(listener);
};

export const getCatalogRefreshState = (libraryId: string) =>
	refreshStates.get(libraryId) || defaultRefreshState;

const assertBulkWrite = (result: { error: unknown[] }, label: string) => {
	if (result.error.length > 0) throw new Error(`${label} failed`);
};

export const reconcileLibrary = async (
	libraryId: string,
	snapshot: ApiLibrarySnapshot
) => reconcileCatalog(catalog, libraryId, snapshot);

export const reconcileCatalog = async (
	target: Catalog,
	libraryId: string,
	snapshot: ApiLibrarySnapshot
) => {
	const normalized = normalizeLibrarySnapshot(libraryId, snapshot);
	const existingTracks = await target.rx.tracks.find({
		selector: { libraryId }
	}).exec();
	const existingAlbums = await target.rx.albums.find({
		selector: { libraryId }
	}).exec();

	const trackWrite = await target.rx.tracks.bulkUpsert(normalized.tracks);
	assertBulkWrite(trackWrite, "Track upsert");
	const albumWrite = await target.rx.albums.bulkUpsert(normalized.albums);
	assertBulkWrite(albumWrite, "Album upsert");
	const libraryWrite = await target.rx.libraries.bulkUpsert(normalized.libraries);
	assertBulkWrite(libraryWrite, "Library upsert");

	const trackKeys = new Set(normalized.tracks.map((track) => track.storageId));
	const albumKeys = new Set(normalized.albums.map((album) => album.storageId));
	const staleTrackKeys = existingTracks
		.map((document) => document.storageId)
		.filter((storageId) => !trackKeys.has(storageId));
	const staleAlbumKeys = existingAlbums
		.map((document) => document.storageId)
		.filter((storageId) => !albumKeys.has(storageId));

	if (staleTrackKeys.length > 0) {
		assertBulkWrite(
			await target.rx.tracks.bulkRemove(staleTrackKeys),
			"Stale track removal"
		);
	}
	if (staleAlbumKeys.length > 0) {
		assertBulkWrite(
			await target.rx.albums.bulkRemove(staleAlbumKeys),
			"Stale album removal"
		);
	}
};

export const refreshLibrary = (libraryId: string) => {
	const existing = refreshPromises.get(libraryId);
	if (existing) return existing;

	setRefreshState(libraryId, {
		isRefreshing: true,
		didError: false,
		hasAttempted: getCatalogRefreshState(libraryId).hasAttempted
	});
	const promise = api(libraryId)
		.get<ApiLibrarySnapshot>("/")
		.then((response) => reconcileLibrary(libraryId, response.data))
		.then(() => {
			setRefreshState(libraryId, {
				isRefreshing: false,
				didError: false,
				hasAttempted: true
			});
		})
		.catch((error) => {
			console.error(`[catalog] failed to refresh ${libraryId}`, error);
			setRefreshState(libraryId, {
				isRefreshing: false,
				didError: true,
				hasAttempted: true
			});
		})
		.finally(() => refreshPromises.delete(libraryId));

	refreshPromises.set(libraryId, promise);
	return promise;
};
