import {
	api,
	getNextTrack,
	getPreviousTrack,
	filterTracks,
	groupTracksIntoAlbums
} from "utils";
import {
	FETCH_TRACKS_START,
	FETCH_TRACKS_SUCCESS,
	FETCH_TRACKS_FAILURE,
	QUEUE_REMOVE,
	QUEUE_PUSH,
	QUEUE_NEW,
	SESSION_PLAY_TRACK,
	SESSION_TRACK_ERROR,
	SESSION_PLAYING_TOGGLE,
	SESSION_PLAYING_UPDATE_STATUS,
	SESSION_PLAYING_AUDIO_REF,
	SESSION_VOLUME,
	SESSION_VOLUME_MUTE,
	SESSION_SHUFFLE_TOGGLE,
	SESSION_REPEAT_TOGGLE,
	SESSION_PIP_TOGGLE,
	COLOR_NEXT,
	UPDATE_USER_SEARCH,
	FILTER_TOGGLE_TAG,
	FILTER_RESET_TAGS,
	SOCKET_CONNECTED_USERS,
	SOCKET_GLOBAL_PLAYING
} from "./mainReducer";

/*
 * Fetch tracks index from api
 */
export const fetchTracks = () => (dispatch) => {
	dispatch({ type: FETCH_TRACKS_START, payload: [] });

	api()
		.get("/tracks")
		.then((res) => {
			// console.log("Tracks:", res.data);
			const albums = groupTracksIntoAlbums(res.data, res.data);
			dispatch({
				type: FETCH_TRACKS_SUCCESS,
				payload: [res.data, albums]
			});
		})
		.catch((error) => {
			dispatch({ type: FETCH_TRACKS_FAILURE, payload: error });
		});
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
 * Play a new track (adds to current session)
 */
export const playTrack = (trackIndex) => (dispatch, getState) => {
	const state = getState();
	const queue = state.music.tracks.queue;
	const queueIndexOfTrack = queue?.indexOf(trackIndex);

	// If track is in the queue, remove it
	if (queue?.length > 0 && queueIndexOfTrack !== -1) {
		console.log({ queueIndexOfTrack });
		const newQueue = [...queue];
		newQueue.splice(queueIndexOfTrack, 1);
		dispatch({ type: QUEUE_NEW, payload: newQueue });
	}

	dispatch({ type: SESSION_PLAY_TRACK, payload: trackIndex });
};

/*
 * Play a random track (uses current filter)
 */
export const playRandomTrack = () => (dispatch, getState) => {
	const state = getState();
	const tracks = state.music.tracks.data;
	let trackList = state.music.tracks.data;
	const tags = state.music.tracks.filter.tags;

	// If filter applied: use filtered tracks
	if (tags.length > 0) trackList = state.music.tracks.filteredData;

	// Select random track
	const ranIndex = Math.floor(Math.random() * trackList.length);
	const ranTrack = trackList[ranIndex];

	// Get actual index of track in data
	const trackIndex = tracks.findIndex(
		(storeTrack) => storeTrack.id === ranTrack.id
	);

	dispatch({ type: SESSION_PLAY_TRACK, payload: trackIndex });
};

/*
 * Play next track
 */
export const playNextTrack = (trackIndex) => (dispatch, getState) => {
	const state = getState();
	const queue = state.music.tracks.queue;

	// Check if there is a queue (serve queue first)
	if (queue.length > 0) {
		const newQueue = [...queue];
		const newIndex = newQueue.shift();
		dispatch({ type: QUEUE_NEW, payload: newQueue });
		return dispatch({ type: SESSION_PLAY_TRACK, payload: newIndex });
	}

	dispatch({ type: SESSION_PLAY_TRACK, payload: getNextTrack(trackIndex) });
};

/*
 * Play previous track
 */
export const playPreviousTrack = (trackIndex) => (dispatch) => {
	dispatch({ type: SESSION_PLAY_TRACK, payload: getPreviousTrack(trackIndex) });
};

/*
 * Decide what to play based on current session
 */
export const playNextTrackBasedOnSession =
	(playNext = true) =>
		(dispatch, getState) => {
			const state = getState();

			if (state.session.actions.shuffle) return dispatch(playRandomTrack());

			if (playNext) {
				dispatch(playNextTrack(state.session.playing.index));
			} else {
				dispatch(playPreviousTrack(state.session.playing.index));
			}
		};

/*
 * Pause currently playing track
 */
export const playingTrackIsPaused = (isPaused) => (dispatch) => {
	dispatch({ type: SESSION_PLAYING_TOGGLE, payload: isPaused });
};

/*
 * Track unable to play; error
 */
export const playingTrackDidError = () => (dispatch) => {
	dispatch({ type: SESSION_TRACK_ERROR, payload: true });
};

/*
 * Update status of playing track
 */
export const sessionUpdatePlayingStatus = (status) => (dispatch) => {
	dispatch({ type: SESSION_PLAYING_UPDATE_STATUS, payload: status });
};

/*
 * Update html audio reference
 */
export const sessionUpdateAudioRef = (audioRef) => (dispatch) => {
	dispatch({ type: SESSION_PLAYING_AUDIO_REF, payload: audioRef });
};

/*
 * Change volume to an exact ammount (0/100)
 */
export const changeVolume = (newVolume) => (dispatch) => {
	dispatch({ type: SESSION_VOLUME, payload: newVolume });
};

/*
 * Mute volume - previous volume level is not effected
 */
export const muteVolume = (isMute) => (dispatch) => {
	dispatch({ type: SESSION_VOLUME_MUTE, payload: isMute });
};

/*
 * Toggle shuffle
 */
export const shuffleToggle = () => (dispatch) => {
	dispatch({ type: SESSION_SHUFFLE_TOGGLE });
};

/*
 * Toggle repeat
 */
export const repeatToggle = () => (dispatch) => {
	dispatch({ type: SESSION_REPEAT_TOGGLE });
};

/*
 * Toggle PIP - picture-in-picture
 */
export const pipToggle = () => (dispatch) => {
	dispatch({ type: SESSION_PIP_TOGGLE });
};

/*
 * New global color
 */
export const colorNext = () => (dispatch) => {
	dispatch({ type: COLOR_NEXT });
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
	const filter = tracks.filter;
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
		tracksFiltered = filterTracks(tracks.data, tracks.data, {
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

/*
 * Socket: update connected users
 */
export const socketConnectedUserCount = (count) => (dispatch) => {
	dispatch({ type: SOCKET_CONNECTED_USERS, payload: count });
};

/*
 * Socket: update global playing session
 */
export const socketGlobalPlaying = (playing) => (dispatch) => {
	dispatch({ type: SOCKET_GLOBAL_PLAYING, payload: playing });
};
