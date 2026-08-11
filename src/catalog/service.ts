import { queryOnce } from "@tanstack/db";

import { catalog, type Catalog } from "./database";
import { buildLibraryTracksQuery } from "./hooks";
import { catalogStorageId } from "./normalize";
import type { TrackRecord } from "./types";

export const getTrack = (libraryId: string, trackId: string) =>
	catalog.tracks.get(catalogStorageId(libraryId, trackId));

export const getOrderedTracks = async (
	libraryId: string,
	tags: string[] = []
): Promise<TrackRecord[]> => {
	const tracks = await queryOnce((q) =>
		buildLibraryTracksQuery(q, catalog.tracks, libraryId, { tags })
	);
	return tracks as TrackRecord[];
};

export const updateCatalogTrackStats = (
	target: Catalog,
	libraryId: string,
	trackId: string
) => {
	const storageId = catalogStorageId(libraryId, trackId);
	if (!target.tracks.has(storageId)) return;
	return target.tracks.update(storageId, (draft) => {
		draft.lastPlayed = Date.now();
		draft.timesPlayed += 1;
	});
};

export const updateTrackStats = (libraryId: string, trackId: string) =>
	updateCatalogTrackStats(catalog, libraryId, trackId);
