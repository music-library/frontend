import { getOrderedTracks, getTrack, updateTrackStats } from "catalog";
import { socketSend } from "lib/index";
import { QUEUE_NEW } from "state/slices/music/musicReducer";
import {
	SESSION_PLAY_TRACK,
	SESSION_TRACK_ERROR,
	SESSION_PLAYBACK_FAILURE,
	SESSION_PLAYING_TOGGLE,
	SESSION_PLAYING_UPDATE_STATUS,
	SESSION_PLAYING_AUDIO_REF,
	SESSION_VOLUME,
	SESSION_VOLUME_MUTE,
	SESSION_SHUFFLE_TOGGLE,
	SESSION_REPEAT_TOGGLE,
	SESSION_PIP_TOGGLE
} from "./sessionReducer";

const playTrackHelper = (dispatch, state, trackId) => {
	const libraryId = state.music.library.selected;
	const track = getTrack(libraryId, trackId);
	if (!track) return;
	updateTrackStats(libraryId, trackId);
	dispatch({ type: SESSION_PLAY_TRACK, payload: { trackId } });
	socketSend("music:playTrack", trackId);
};

export const playTrack = (trackId) => (dispatch, getState) => {
	const state = getState();
	const queueIndex = state.music.queue.indexOf(trackId);
	if (queueIndex !== -1) {
		const queue = [...state.music.queue];
		queue.splice(queueIndex, 1);
		dispatch({ type: QUEUE_NEW, payload: queue });
	}
	playTrackHelper(dispatch, state, trackId);
};

export const playRandomTrack = () => async (dispatch, getState) => {
	const state = getState();
	const tracks = await getOrderedTracks(
		state.music.library.selected,
		state.music.filter.tags
	);
	if (tracks.length === 0) return;
	const track = tracks[Math.floor(Math.random() * tracks.length)];
	playTrackHelper(dispatch, getState(), track.id);
};

export const playNextTrack = (trackId) => async (dispatch, getState) => {
	let state = getState();
	const queue = [...state.music.queue];
	while (queue.length > 0) {
		const queuedTrackId = queue.shift();
		dispatch({ type: QUEUE_NEW, payload: [...queue] });
		state = getState();
		if (getTrack(state.music.library.selected, queuedTrackId)) {
			playTrackHelper(dispatch, state, queuedTrackId);
			return;
		}
	}

	const tracks = await getOrderedTracks(
		state.music.library.selected,
		state.music.filter.tags
	);
	if (tracks.length === 0) return;
	const currentIndex = tracks.findIndex((track) => track.id === trackId);
	const nextIndex = currentIndex < 0 || currentIndex + 1 >= tracks.length
		? 0
		: currentIndex + 1;
	playTrackHelper(dispatch, getState(), tracks[nextIndex].id);
};

export const playPreviousTrack = (trackId) => async (dispatch, getState) => {
	const state = getState();
	const tracks = await getOrderedTracks(
		state.music.library.selected,
		state.music.filter.tags
	);
	if (tracks.length === 0) return;
	const currentIndex = tracks.findIndex((track) => track.id === trackId);
	const previousIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
	playTrackHelper(dispatch, getState(), tracks[previousIndex].id);
};

export const playNextTrackBasedOnSession = (playNext = true) => (dispatch, getState) => {
	const state = getState();
	if (state.session.actions.shuffle && !state.music.queue.length) {
		return dispatch(playRandomTrack());
	}
	return dispatch(
		playNext
			? playNextTrack(state.session.playing.trackId)
			: playPreviousTrack(state.session.playing.trackId)
	);
};

export const playingTrackIsPaused = (isPaused) => (dispatch) =>
	dispatch({ type: SESSION_PLAYING_TOGGLE, payload: isPaused });

export const playingTrackDidError = (playbackFailure = null) => (dispatch) =>
	dispatch({ type: SESSION_TRACK_ERROR, payload: playbackFailure });

export const sessionUpdatePlaybackFailure = (playbackFailure) => (dispatch) =>
	dispatch({ type: SESSION_PLAYBACK_FAILURE, payload: playbackFailure });

export const sessionUpdatePlayingStatus = (status) => (dispatch) =>
	dispatch({ type: SESSION_PLAYING_UPDATE_STATUS, payload: status });

export const sessionUpdateAudioRef = (audioRef) => (dispatch) =>
	dispatch({ type: SESSION_PLAYING_AUDIO_REF, payload: audioRef });

export const changeVolume = (newVolume) => (dispatch) =>
	dispatch({ type: SESSION_VOLUME, payload: newVolume });

export const muteVolume = (isMute) => (dispatch) =>
	dispatch({ type: SESSION_VOLUME_MUTE, payload: isMute });

export const shuffleToggle = () => (dispatch) =>
	dispatch({ type: SESSION_SHUFFLE_TOGGLE });

export const repeatToggle = () => (dispatch) =>
	dispatch({ type: SESSION_REPEAT_TOGGLE });

export const pipToggle = () => (dispatch) =>
	dispatch({ type: SESSION_PIP_TOGGLE });
