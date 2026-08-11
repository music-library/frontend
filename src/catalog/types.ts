export type ApiTrack = {
	id: string;
	id_album: string;
	metadata: {
		track: number;
		title: string;
		artist: string;
		album_artist: string;
		album: string;
		year: string;
		decade: string;
		genre: string;
		composer: string;
		duration: number;
	};
	stats: {
		timesPlayed: number;
		lastPlayed: number;
	};
};

export type ApiLibrary = {
	id: string;
	name: string;
};

export type ApiLibrarySnapshot = {
	id: string;
	name: string;
	libraries: ApiLibrary[];
	tracks: ApiTrack[];
	tracks_map: Record<string, number>;
	albums: Record<string, string[]>;
	decades: string[];
	genres: string[];
};

export type TrackRecord = {
	storageId: string;
	libraryId: string;
	id: string;
	albumId: string;
	order: number;
	trackNumber: number;
	title: string;
	artist: string;
	albumArtist: string;
	albumTitle: string;
	year: string;
	decade: string;
	genre: string;
	composer: string;
	duration: number;
	timesPlayed: number;
	lastPlayed: number;
};

export type AlbumRecord = {
	storageId: string;
	libraryId: string;
	id: string;
	order: number;
	coverTrackId: string;
	title: string;
	artist: string;
	year: string;
	genre: string;
};

export type LibraryRecord = {
	id: string;
	name: string;
};

export type NormalizedCatalog = {
	tracks: TrackRecord[];
	albums: AlbumRecord[];
	libraries: LibraryRecord[];
};

export type CatalogRefreshState = {
	isRefreshing: boolean;
	didError: boolean;
	hasAttempted: boolean;
};
