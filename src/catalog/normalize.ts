import type {
	AlbumRecord,
	ApiLibrarySnapshot,
	ApiTrack,
	NormalizedCatalog,
	TrackRecord
} from "./types";

export const catalogStorageId = (libraryId: string, id: string) =>
	`${libraryId}:${id}`;

const isNonEmptyString = (value: unknown): value is string =>
	typeof value === "string" && value.length > 0;

const assertTrack = (track: ApiTrack, index: number) => {
	if (!track || !isNonEmptyString(track.id) || !isNonEmptyString(track.id_album)) {
		throw new Error(`Invalid track at index ${index}`);
	}
	if (!track.metadata || !track.stats) {
		throw new Error(`Track ${track.id} is missing metadata or stats`);
	}
	for (const [field, value] of Object.entries({
		track: track.metadata.track,
		duration: track.metadata.duration,
		timesPlayed: track.stats.timesPlayed,
		lastPlayed: track.stats.lastPlayed
	})) {
		if (!Number.isFinite(Number(value))) {
			throw new Error(`Track ${track.id} has an invalid ${field}`);
		}
	}
};

const numericValue = (value: unknown, fallback: number) => {
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : fallback;
};

const toTrackRecord = (
	libraryId: string,
	track: ApiTrack,
	order: number
): TrackRecord => ({
	storageId: catalogStorageId(libraryId, track.id),
	libraryId,
	id: track.id,
	albumId: track.id_album,
	order,
	trackNumber: numericValue(track.metadata.track, 0),
	title: track.metadata.title || "(unknown)",
	artist: track.metadata.artist || "~",
	albumArtist: track.metadata.album_artist || "~",
	albumTitle: track.metadata.album || "~",
	year: track.metadata.year || "~",
	decade: track.metadata.decade || "~",
	genre: track.metadata.genre || "~",
	composer: track.metadata.composer || "~",
	duration: numericValue(track.metadata.duration, 0),
	timesPlayed: numericValue(track.stats.timesPlayed, 0),
	lastPlayed: numericValue(track.stats.lastPlayed, -1)
});

export const normalizeLibrarySnapshot = (
	libraryId: string,
	snapshot: ApiLibrarySnapshot
): NormalizedCatalog => {
	if (!isNonEmptyString(libraryId) || !snapshot || !Array.isArray(snapshot.tracks)) {
		throw new Error("Invalid library snapshot");
	}
	if (!snapshot.albums || typeof snapshot.albums !== "object" || Array.isArray(snapshot.albums)) {
		throw new Error("Library snapshot is missing albums");
	}
	if (!snapshot.tracks_map || typeof snapshot.tracks_map !== "object" || Array.isArray(snapshot.tracks_map)) {
		throw new Error("Library snapshot is missing its track map");
	}
	if (!Array.isArray(snapshot.libraries)) {
		throw new Error("Library snapshot is missing libraries");
	}

	const tracks = snapshot.tracks.map((track, index) => {
		assertTrack(track, index);
		if (snapshot.tracks_map[track.id] !== index) {
			throw new Error(`Track map order does not match track ${track.id}`);
		}
		return toTrackRecord(libraryId, track, index);
	});
	const tracksById = new Map(tracks.map((track) => [track.id, track]));
	if (tracksById.size !== tracks.length) {
		throw new Error("Library snapshot contains duplicate track IDs");
	}
	if (Object.keys(snapshot.tracks_map).length !== tracks.length) {
		throw new Error("Library snapshot track map contains unexpected entries");
	}

	const albums = Object.entries(snapshot.albums).map(
		([albumId, trackIds], fallbackOrder) => {
			if (!isNonEmptyString(albumId) || !Array.isArray(trackIds) || trackIds.length === 0) {
				throw new Error(`Invalid album ${albumId || fallbackOrder}`);
			}
			if (new Set(trackIds).size !== trackIds.length) {
				throw new Error(`Album ${albumId} contains duplicate tracks`);
			}

			const albumTracks = trackIds.map((trackId) => tracksById.get(trackId));
			if (albumTracks.some((track) => !track)) {
				throw new Error(`Album ${albumId} references a missing track`);
			}

			const firstTrack = albumTracks[0] as TrackRecord;
			if (albumTracks.some((track) => track?.albumId !== albumId)) {
				throw new Error(`Album ${albumId} contains a track from another album`);
			}
			const order = Math.min(
				...albumTracks.map((track) => (track as TrackRecord).order)
			);

			return {
				storageId: catalogStorageId(libraryId, albumId),
				libraryId,
				id: albumId,
				order,
				coverTrackId: trackIds[0],
				title: firstTrack.albumTitle,
				artist: firstTrack.albumArtist,
				year: firstTrack.year,
				genre: firstTrack.genre
			};
		}
	);

	const libraries = snapshot.libraries.map((library) => {
		if (!isNonEmptyString(library?.id) || !isNonEmptyString(library?.name)) {
			throw new Error("Invalid library option");
		}
		return { id: library.id, name: library.name };
	});

	return {
		tracks,
		albums: albums.sort((left, right) => left.order - right.order),
		libraries
	};
};
