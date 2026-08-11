import type { ApiLibrarySnapshot, ApiTrack } from "./types";

type ApiTrackOverrides = Omit<Partial<ApiTrack>, "metadata" | "stats"> & {
	metadata?: Partial<ApiTrack["metadata"]>;
	stats?: Partial<ApiTrack["stats"]>;
};

export const apiTrack = (
	id: string,
	albumId: string,
	overrides: ApiTrackOverrides = {}
): ApiTrack => ({
	id,
	id_album: albumId,
	...overrides,
	metadata: {
		track: 1,
		title: `Title ${id}`,
		artist: `Artist ${id}`,
		album_artist: `Album artist ${albumId}`,
		album: `Album ${albumId}`,
		year: "1994",
		decade: "1990",
		genre: "Rock",
		composer: "Composer",
		duration: 180,
		...overrides.metadata
	},
	stats: {
		timesPlayed: 0,
		lastPlayed: -1,
		...overrides.stats
	}
});

export const apiSnapshot = (
	tracks: ApiTrack[] = [apiTrack("track-a", "album-a")],
	albums: Record<string, string[]> = { "album-a": ["track-a"] }
): ApiLibrarySnapshot => ({
	id: "main",
	name: "Main",
	libraries: [
		{ id: "main", name: "Main" },
		{ id: "other", name: "Other" }
	],
	tracks,
	tracks_map: Object.fromEntries(tracks.map((track, index) => [track.id, index])),
	albums,
	decades: ["1990"],
	genres: ["Rock"]
});
