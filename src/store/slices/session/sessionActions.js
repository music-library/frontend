import { getNextTrack, getPreviousTrack } from "utils";
import { TRACK_STAT_UPDATE, QUEUE_NEW } from "store/slices/music/musicReducer";
import {
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
} from "./sessionReducer";

const playTrackHelper = (dispatch, state, trackIndex) => {
	if (state.music.isFetching || state.music.didError) return state;
	dispatch({ type: TRACK_STAT_UPDATE, payload: trackIndex });
	dispatch({ type: SESSION_PLAY_TRACK, payload: { trackIndex, track: state?.music?.tracks?.[trackIndex] } });
}

/*
 * Play a new track (adds to current session)
 */
export const playTrack = (trackIndex) => (dispatch, getState) => {
	const state = getState();
	const queue = state.music.queue;
	const queueIndexOfTrack = queue?.indexOf(trackIndex);

	// If track is in the queue, remove it
	if (queue?.length > 0 && queueIndexOfTrack !== -1) {
		const newQueue = [...queue];
		newQueue.splice(queueIndexOfTrack, 1);
		dispatch({ type: QUEUE_NEW, payload: newQueue });
	}

	playTrackHelper(dispatch, state, trackIndex);
};

/*
 * Play a random track (uses current filter)
 */
export const playRandomTrack = () => (dispatch, getState) => {
	const state = getState();
	const tracks = state.music.tracks;
	let trackList = state.music.tracks;
	const tags = state.music.filter.tags;

	// If filter applied: use filtered tracks
	if (tags.length > 0) trackList = state.music.filteredData;

	// Select random track
	const ranIndex = Math.floor(Math.random() * trackList.length);
	const ranTrack = trackList[ranIndex];

	// Get actual index of track in data
	const trackIndex = tracks.findIndex(
		(storeTrack) => storeTrack.id === ranTrack.id
	);

	playTrackHelper(dispatch, state, trackIndex);
};

/*
 * Play next track
 */
export const playNextTrack = (trackIndex) => (dispatch, getState) => {
	const state = getState();
	const queue = state.music.queue;

	// Check if there is a queue (serve queue first)
	if (queue.length > 0) {
		const newQueue = [...queue];
		const newIndex = newQueue.shift();
		dispatch({ type: QUEUE_NEW, payload: newQueue });
		return playTrackHelper(dispatch, state, newIndex);
	}

	playTrackHelper(dispatch, state, getNextTrack(trackIndex));
};

/*
 * Play previous track
 */
export const playPreviousTrack = (trackIndex) => (dispatch, getState) => {
	playTrackHelper(dispatch, getState(), getPreviousTrack(trackIndex));
};

/*
 * Decide what to play based on current session
 */
export const playNextTrackBasedOnSession = (playNext = true) => (dispatch, getState) => {
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
