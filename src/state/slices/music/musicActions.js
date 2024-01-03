import {
	api,
	filterTracks
} from "lib/index";
import {
	LIBRARY_SWITCH,
	LIBRARY_FETCH_START,
	LIBRARY_FETCH_SUCCESS,
	LIBRARY_FETCH_FAILURE,
	QUEUE_REMOVE,
	QUEUE_PUSH,
	QUEUE_NEW,
	UPDATE_USER_SEARCH,
	FILTER_TOGGLE_TAG,
	FILTER_RESET_TAGS
} from "./musicReducer";
import {
	SESSION_CLEAR
} from "../session/sessionReducer";

/*
 * Fetch music-library index from api
 */
export const fetchLibrary = (library) => async (dispatch) => {
	try {
		dispatch({ type: LIBRARY_FETCH_START, payload: library });
		const res = await api(library).get(`/`);
		dispatch({ type: LIBRARY_FETCH_SUCCESS, payload: res.data });
	} catch (error) {
		dispatch({ type: LIBRARY_FETCH_FAILURE, payload: error });
	}
};

/*
 * Switch to a different music library
 */
export const switchLibrary = (library) => async (dispatch) => {
	dispatch({ type: SESSION_CLEAR });
	dispatch({ type: LIBRARY_SWITCH, payload: library });
};

/*
 * Update track stats (play count, last played)
 */
export const trackStatUpdate = (trackIndex) => (dispatch) => {
	dispatch({ type: TRACK_STAT_UPDATE, payload: trackIndex });
};

/*
 * Remove a track from the Queue
 */
export const queueRemove = (trackIndex) => (dispatch) => {
	dispatch({ type: QUEUE_REMOVE, payload: trackIndex });
};

/*
 * Queue a track for future playback
 */
export const queuePush = (trackIndex) => (dispatch) => {
	dispatch({ type: QUEUE_PUSH, payload: trackIndex });
};

/*
 * Overwrite entire queue with a new array
 */
export const queueNew = (newQueue) => (dispatch) => {
	dispatch({ type: QUEUE_NEW, payload: newQueue });
};

/*
 * Update search input value
 */
export const updateUserSearch = (search) => (dispatch) => {
	dispatch({ type: UPDATE_USER_SEARCH, payload: search });
};

/*
 * Toggle filter tags array value
 */
export const filterToggleTag = (tag) => (dispatch, getState) => {
	const state = getState();
	const tracks = state.music.tracks;
	const filter = state.music.filter;

	const tags = [...filter.tags];
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
		tracksFiltered = filterTracks(tracks, tracks, {
			...filter,
			tags
		});
	}

	// Update tags array
	dispatch({
		type: FILTER_TOGGLE_TAG,
		payload: {
			tags: tags,
			filteredData: tracksFiltered
		}
	});
};

/*
 * Reset all selected tags
 */
export const filterResetTags = () => (dispatch) => {
	dispatch({ type: FILTER_RESET_TAGS });
};
