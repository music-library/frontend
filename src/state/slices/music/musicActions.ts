import { useSelector } from "lib/hooks";
import { api, filterTracks } from "lib/index";
import { updateSlice, updateState } from "state/store";

import { sessionClear } from "../session/sessionActions";
import { getQueue, isTrackId, persistQueue } from "./musicStore";

/*
 * Fetch music-library index from api
 */
export const fetchLibrary = async (library: string) => {
	try {
		updateSlice("music", (music) => {
			music.didError = false;
			music.isFetching = true;
		});

		const res = await api(library).get(`/`);

		const tracksMap = res.data?.tracks_map || {};

		updateSlice("music", (music) => {
			music.didError = false;
			music.isFetching = false;
			music.library = {
				...music.library,
				options: res.data?.libraries
			};
			music.tracks = res.data?.tracks;
			music.queue = music.queue.filter((trackId) =>
				Object.prototype.hasOwnProperty.call(tracksMap, trackId)
			);
			music.tracksMap = tracksMap;
			music.albumsMap = res.data?.albums;
			music.decades = res.data?.decades;
			music.genres = res.data?.genres;
		});
	} catch (error) {
		updateSlice("music", (music) => {
			music.didError = true;
			music.isFetching = false;
		});
	}
};

/*
 * Switch to a different music library
 */
export const switchLibrary = (library: string) => {
	updateState((state) => {
		if (state.music.library.selected === library) return;

		const libraryQueue = getQueue(library);
		localStorage.setItem("library/selected", library);

		sessionClear();

		state.music = {
			...state.music,
			didError: false,
			isFetching: true,
			library: {
				...state.music.library,
				selected: library
			},
			queue: libraryQueue,
			filter: {
				tags: [],
				search: ""
			},
			filteredData: [],
			tracks: [],
			tracksMap: {},
			albumsMap: {},
			decades: [],
			genres: []
		};
	});
};

/*
 * Update track stats (play count, last played)
 */
export const trackStatUpdate = (trackIndex) => {
	updateSlice("music", (music) => {
		// Update track stats
		// * Last played timestamp
		// * Times played count
		const newData = [...music.tracks];
		newData[trackIndex] = {
			...newData[trackIndex],
			stats: {
				...newData[trackIndex].stats,
				lastPlayed: Date.now(),
				timesPlayed: newData[trackIndex].stats.timesPlayed + 1
			}
		};

		music.tracks = newData;
	});
};

/*
 * Remove a track from the Queue
 */
export const queueRemove = (trackId) => {
	updateSlice("music", (music) => {
		const queueWithoutTrack = music.queue.filter((tId) => tId !== trackId);
		persistQueue(music.library.selected, queueWithoutTrack);
		music.queue = queueWithoutTrack;
	});
};

/*
 * Queue a track for future playback
 */
export const queuePush = (trackId) => {
	updateSlice("music", (music) => {
		const queueWithTrack = [...music.queue, trackId];
		persistQueue(music.library.selected, queueWithTrack);
		music.queue = queueWithTrack;
	});
};

/*
 * Overwrite entire queue with a new array
 */
export const queueNew = (newQueue: any[]) => {
	updateSlice("music", (music) => {
		const queue = newQueue.filter(isTrackId);
		persistQueue(music.library.selected, queue);
		music.queue = queue;
	});
};

/*
 * Update search input value
 */
export const updateUserSearch = (search: string) => {
	updateSlice("music", (music) => {
		music.filter = {
			...music.filter,
			search
		};
	});
};

/*
 * Toggle filter tags array value
 */
export const filterToggleTag = (tag) => {
	updateSlice("music", (music) => {
		const tags = [...music.filter.tags];
		let tracksFiltered = [];

		// If tag already exists in tags array
		// -> remove it
		if (tags.includes(tag)) {
			const index = tags.indexOf(tag);
			if (index !== -1) tags.splice(index, 1);
		} else {
			// -> add tag
			tags.push(tag);
		}

		// Filter tracks
		if (tags.length > 0) {
			tracksFiltered = filterTracks(music.tracks, music.tracks, {
				...music.filter,
				tags
			});
		}

		music.filter = {
			...music.filter,
			tags
		};
		music.filteredData = tracksFiltered;
	});
};

/*
 * Reset all selected tags
 */
export const filterResetTags = () => {
	updateSlice("music", (music) => {
		music.filter = {
			...music.filter,
			tags: []
		};
		music.filteredData = [];
	});
};

/**
 * Cache exists and can be rendered
 */
export const useShouldRenderTrackCache = () =>
	useSelector(
		(state) =>
			(state.music.isFetching || state.music.didError) &&
			state.music.tracks?.length > 0
	);
