import { and, eq, gt, ilike, inArray, or } from "@tanstack/db";
import { useLiveQuery } from "@tanstack/react-db";
import { useMemo, useSyncExternalStore } from "react";

import { catalogStorageId } from "./normalize";
import {
	catalog,
	getCatalogRefreshState,
	subscribeCatalogRefresh
} from "./database";
import type { TrackRecord } from "./types";

type TrackQueryOptions = {
	tags?: string[];
	search?: string;
	includeSearch?: boolean;
};

const tagConditions = (track: any, tags: string[]) => {
	const decades = tags.filter((tag) => /^\d{4}$/.test(tag));
	const genres = tags.filter((tag) => !/^\d{4}$/.test(tag));
	const conditions = [];
	if (genres.length > 0) conditions.push(inArray(track.genre, genres));
	if (decades.length > 0) conditions.push(inArray(track.decade, decades));
	if (conditions.length === 2) return and(conditions[0], conditions[1]);
	return conditions[0];
};

export const buildLibraryTracksQuery = (
	q: any,
	tracks: typeof catalog.tracks,
	libraryId: string,
	options: TrackQueryOptions = {}
) => {
	const tags = options.tags || [];
	const search = options.includeSearch ? options.search?.trim() || "" : "";
	let query = q
		.from({ track: tracks })
		.where(({ track }: any) => eq(track.libraryId, libraryId));
	if (tags.length > 0) {
		query = query.where(({ track }: any) => tagConditions(track, tags));
	}
	if (search) {
		const pattern = `%${search}%`;
		query = query.where(({ track }: any) =>
			or(
				ilike(track.title, pattern),
				ilike(track.albumTitle, pattern),
				ilike(track.artist, pattern),
				ilike(track.albumArtist, pattern),
				ilike(track.year, pattern)
			)
		);
	}
	return query.orderBy(({ track }: any) => track.order, "asc");
};

export const buildLibraryAlbumsQuery = (
	q: any,
	albums: typeof catalog.albums,
	libraryId: string
) => q
	.from({ album: albums })
	.where(({ album }: any) => eq(album.libraryId, libraryId))
	.orderBy(({ album }: any) => album.order, "asc");

export const buildAlbumTracksQuery = (
	q: any,
	tracks: typeof catalog.tracks,
	libraryId: string,
	albumId: string
) => q
	.from({ track: tracks })
	.where(({ track }: any) =>
		and(eq(track.libraryId, libraryId), eq(track.albumId, albumId))
	)
	.orderBy(({ track }: any) => track.trackNumber, "asc")
	.orderBy(({ track }: any) => track.order, "asc");

export const buildPopularTracksQuery = (
	q: any,
	tracks: typeof catalog.tracks,
	libraryId: string,
	limit: number
) => q
	.from({ track: tracks })
	.where(({ track }: any) =>
		and(eq(track.libraryId, libraryId), gt(track.timesPlayed, 1))
	)
	.orderBy(({ track }: any) => track.timesPlayed, "desc")
	.limit(limit);

export const buildRecentlyPlayedTracksQuery = (
	q: any,
	tracks: typeof catalog.tracks,
	libraryId: string,
	limit: number
) => q
	.from({ track: tracks })
	.where(({ track }: any) =>
		and(eq(track.libraryId, libraryId), gt(track.lastPlayed, -1))
	)
	.orderBy(({ track }: any) => track.lastPlayed, "desc")
	.limit(limit);

export const getDistinctAlbumIds = (tracks: Array<{ albumId: string }>) =>
	[...new Set(tracks.map((track) => track.albumId))];

export const getDistinctCatalogTags = (
	tracks: Array<{ genre: string; decade: string }>
) => ({
	genres: [...new Set(tracks.map((track) => track.genre).filter(Boolean))].sort(),
	decades: [...new Set(tracks.map((track) => track.decade).filter(Boolean))].sort()
});

export const useLibraryTracks = (
	libraryId: string,
	options: TrackQueryOptions = {}
) => {
	const tags = options.tags || [];
	const search = options.includeSearch ? options.search?.trim() || "" : "";
	return useLiveQuery(
		(q) => buildLibraryTracksQuery(q, catalog.tracks, libraryId, options),
		[libraryId, tags.join("|"), search]
	);
};

export const useLibraryAlbums = (libraryId: string) =>
	useLiveQuery(
		(q) => buildLibraryAlbumsQuery(q, catalog.albums, libraryId),
		[libraryId]
	);

export const useAlbum = (libraryId: string, albumId?: string) =>
	useLiveQuery(
		(q) =>
			albumId
				? q
						.from({ album: catalog.albums })
						.where(({ album }) =>
							eq(album.storageId, catalogStorageId(libraryId, albumId))
						)
						.findOne()
				: undefined,
		[libraryId, albumId]
	);

export const useTrack = (libraryId: string, trackId?: string | null) =>
	useLiveQuery(
		(q) =>
			trackId
				? q
						.from({ track: catalog.tracks })
						.where(({ track }) =>
							eq(track.storageId, catalogStorageId(libraryId, trackId))
						)
						.findOne()
				: undefined,
		[libraryId, trackId]
	);

export const useAlbumTracks = (libraryId: string, albumId?: string) =>
	useLiveQuery(
		(q) =>
			albumId
				? buildAlbumTracksQuery(q, catalog.tracks, libraryId, albumId)
				: undefined,
		[libraryId, albumId]
	);

export const useLibraries = () =>
	useLiveQuery((q) =>
		q.from({ library: catalog.libraries }).orderBy(({ library }) => library.name)
	);

export const usePopularTracks = (libraryId: string, limit: number) =>
	useLiveQuery(
		(q) => buildPopularTracksQuery(q, catalog.tracks, libraryId, limit),
		[libraryId, limit]
	);

export const useRecentlyPlayedTracks = (libraryId: string, limit: number) =>
	useLiveQuery(
		(q) => buildRecentlyPlayedTracksQuery(q, catalog.tracks, libraryId, limit),
		[libraryId, limit]
	);

export const useCatalogTags = (libraryId: string) => {
	const { data = [], ...query } = useLibraryTracks(libraryId);
	const { genres, decades } = useMemo(
		() => getDistinctCatalogTags(data as TrackRecord[]),
		[data]
	);
	return { ...query, data, genres, decades };
};

export const useCatalogRefreshState = (libraryId: string) =>
	useSyncExternalStore(
		subscribeCatalogRefresh,
		() => getCatalogRefreshState(libraryId),
		() => getCatalogRefreshState(libraryId)
	);
