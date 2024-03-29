import Fuse from "fuse.js";
import sha1 from "crypto-js/sha1";

import store from "state/index";

/*
 * Returns Album from Id
 */
export const getAlbum = (albumIdOrTrackId) => {
	const state = store.getState();
	const tracks = state.music.tracks;
	const tracksMap = state.music.tracksMap;
	const albumsMap = state.music.albumsMap;

	const album = {};
	let trackFromAlbum = {};

	// Check if albumIdOrTrackId is an album id
	if (albumsMap?.[albumIdOrTrackId]) {
		trackFromAlbum = tracks?.[tracksMap?.[albumsMap?.[albumIdOrTrackId]?.[0]]];
	}

	// Check if albumIdOrTrackId is a track id
	if (tracksMap?.[albumIdOrTrackId]) {
		trackFromAlbum = tracks?.[tracksMap?.[albumIdOrTrackId]];
	}

	album.id = trackFromAlbum.id_album;
	album.idCover = albumsMap?.[trackFromAlbum.id_album]?.[0];
	album.album = trackFromAlbum?.metadata?.album;
	album.album_artist = trackFromAlbum?.metadata?.album_artist;
	album.genre = trackFromAlbum?.metadata?.genre;
	album.year = trackFromAlbum?.metadata?.year;
	album.tracks = albumsMap?.[trackFromAlbum.id_album];

	return album;
}

/*
 * Get next track index
 *
 * @Note: Does not check queue
 */
export const getNextTrack = (trackIndex) => {
	const state = store.getState();
	const tracks = state.music.tracks;
	const filter = state.music.filter;

	let newIndex = 0;

	// Check if filter is applied
	if (filter.tags.length > 0) {
		// #1 Re-create filter
		// #2 Is current track in filter
		const tracksFiltered = state.music.filteredData;
		const [trackExists, trackIndexFiltered] = doesTrackExist(
			tracksFiltered,
			tracks[trackIndex]
		);

		if (trackExists) {
			newIndex = trackIndexFiltered + 1;
			if (tracksFiltered.length <= newIndex) newIndex = 0;

			newIndex = tracks.findIndex(
				(storeTrack) =>
					storeTrack.id === tracksFiltered[newIndex].id
			);

			return newIndex;
		}
	}

	// #1 attempt to play next track
	newIndex = trackIndex + 1;

	// If end of all tracks
	// loop to first track
	if (tracks.length <= newIndex) {
		// #3 loop entire playlist to first track
		newIndex = 0;
	}

	return newIndex;
};

/*
 * Get previous track index
 */
export const getPreviousTrack = (trackIndex) => {
	const state = store.getState();
	const tracks = state.music.tracks;
	const filter = state.music.filter;

	let newIndex = 0;

	// Check if filter is applied
	if (filter.tags.length > 0) {
		// #1 Re-create filter
		// #2 Is current track in filter
		const tracksFiltered = state.music.filteredData;
		const [trackExists, trackIndexFiltered] = doesTrackExist(
			tracksFiltered,
			tracks[trackIndex]
		);

		if (trackExists) {
			newIndex = trackIndexFiltered - 1;
			if (newIndex < 0) newIndex = tracksFiltered.length - 1;

			newIndex = tracks.findIndex(
				(storeTrack) =>
					storeTrack.id === tracksFiltered[newIndex].id
			);

			return newIndex;
		}
	}

	// #1 attempt to play previous track
	newIndex = trackIndex - 1;

	// If end of all tracks
	// loop to end track
	if (newIndex < 0) {
		// #3 loop entire playlist to end track
		newIndex = tracks.length - 1;
	}

	return newIndex;
};

/*
 * Group tracks into albums
 *
 * @param {tracksStore}    tracks store object
 * @param {tracksToGroup}  tracks to group object
 * @return                 array of albums with keys to each track in store
 */
export const groupTracksIntoAlbums = (tracksToGroup = []) => {
	const albumIds = {};

	// Loop each track
	// populate albums array
	tracksToGroup.forEach((track, i) => {
		albumIds[track?.id_album] = true;
	});

	return Object.keys(albumIds);
};

/*
 * Fuzzy-search for a track in tracks array
 *
 * @param {album}   album object
 * @param {filter}  filter options
 * @return          bool: if match found
 */
export const fuzzySearchForTrack = (tracks, filter) => {
	// Run search on all tracks
	const fuse = new Fuse(tracks, {
		threshold: 0.2,
		keys: [
			"metadata.title",
			"metadata.album",
			"metadata.artist",
			"metadata.album_artist",
			"metadata.year",
		],
	});

	// List of matches
	const found = fuse.search(filter.search);

	if (found.length > 0) return true;
	return false;
};

/*
 * Filter tracks from selected tags or user input
 *
 * @param {data}    tracks array
 * @param {filter}  filter options
 * @return          array of index keys for state.music.albums.data
 */
export const filterTracks = (
	tracksStore,
	tracksToFilter,
	filter,
	includeSearch = false
) => {
	return tracksToFilter?.reduce(function (filtered, track, key) {
		// RegExp filter tags (case-insensitive)
		const regexTags = new RegExp(filter.tags.join("|"), "i");

		// Run search on each track
		if (filter.search.length > 0 && includeSearch) {
			const trackFound = fuzzySearchForTrack([track], filter);
			if (!trackFound) return filtered;
		}

		// If no filter applyed: add all all tracks
		if (filter.tags.length === 0) {
			filtered.push(track);
			return filtered;
		}

		const genre = track?.metadata?.genre;
		const year = track?.metadata?.year;
		const decade = Math.floor(year / 10) * 10;

		// If track tag matches filter in RegExp
		if (filter.tags.length > 0) {
			const matchedGenre = regexTags.test(genre);
			const matchedDecade = regexTags.test(decade);

			if (matchedGenre || matchedDecade) {
				const isDecadeInTags = filter.tags
					.join("|")
					.match(/[12][0-9]{3}/gi);

				if (isDecadeInTags && isDecadeInTags?.length > 0) {
					// Add track if:
					// 1. both the genre & decade match (e.g. Latin track in the 1950s)
					// 2. only decades are selected, no genre(s)
					if (
						(matchedGenre && matchedDecade) ||
						isDecadeInTags.length === filter.tags.length
					)
						filtered.push(track);
				} else {
					// If only genre(s) selected, add track
					filtered.push(track);
				}
			}
		}

		return filtered;
	}, []);
};

/*
 * Deturmines if a track exists
 *
 * @param  {data}    tracks array
 * @param  {filter}  filter options
 * @return {object}  index of album and track
 */
export const doesTrackExist = (data, track) => {
	const res = [false, -1];

	// Loop all tracks
	data.some((trackLoop, index) => {
		if (track?.id === trackLoop?.id) {
			res[0] = true;
			res[1] = index;
			return true;
		}

		if (res[0]) return true;
		return false;
	});

	return res;
};

export const numberOfAlbumsOnOneRow = () => {
	let width = window.innerWidth;
	let albumsPerRow;

	switch (true) {
		case width < 800:
			albumsPerRow = 2;
			break;

		case width < 1100:
			albumsPerRow = 3;
			break;

		case width < 1500:
			albumsPerRow = 4;
			break;

		case width < 1800:
			albumsPerRow = 5;
			break;

		default:
			albumsPerRow = 7;
	}

	return albumsPerRow;
};

export const numberOfTracksOnOneRow = () => {
	let width = window.innerWidth;
	let tracksPerRow;

	switch (true) {
		case width < 850:
			tracksPerRow = 1;
			break;

		case width < 1400:
			tracksPerRow = 2;
			break;

		case width < 1800:
			tracksPerRow = 3;
			break;

		default:
			tracksPerRow = 4;
	}

	return tracksPerRow;
};

export const nRowsOfAlbums = (rows) => {
	return numberOfAlbumsOnOneRow() * rows;
};

export const nRowsOfTracks = (rows) => {
	return numberOfTracksOnOneRow() * rows;
};
