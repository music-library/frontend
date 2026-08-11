import { getNextTrack, getPreviousTrack, socketSend } from "lib/index";
import { store, updateSlice } from "state/store";

import { queueNew, trackStatUpdate } from "../music/musicActions";
import { sessionStore } from "./sessionStore";

const playTrackHelper = (trackIndex) => {
	if (store.state.music.isFetching || store.state.music.didError) return store.state;
	const track = store.state?.music?.tracks?.[trackIndex];

	updateSlice("session", (session) => {
		session.playing = {
			...session.playing,
			didError: false,
			playbackFailure: null,
			isPaused: false,
			index: parseInt(trackIndex),
			track: track
		};
	});
	trackStatUpdate(trackIndex);
	socketSend("music:playTrack", track?.id);
};

/*
 * Play a new track (adds to current session)
 */
export const playTrack = (trackIndex) => {
	const queue = store.state.music.queue;
	const trackId = store.state.music.tracks?.[trackIndex]?.id;
	const queueIndexOfTrack = queue?.indexOf(trackId);

	// If track is in the queue, remove it
	if (queue?.length > 0 && queueIndexOfTrack !== -1) {
		const newQueue = [...queue];
		newQueue.splice(queueIndexOfTrack, 1);
		queueNew(newQueue);
	}

	playTrackHelper(trackIndex);
};

/*
 * Play a random track (uses current filter)
 */
export const playRandomTrack = () => {
	const tracks = store.state.music.tracks;
	let trackList = store.state.music.tracks;
	const tags = store.state.music.filter.tags;

	// If filter applied: use filtered tracks
	if (tags.length > 0) trackList = store.state.music.filteredData;

	// Select random track
	const ranIndex = Math.floor(Math.random() * trackList.length);
	const ranTrack = trackList[ranIndex];

	// Get actual index of track in data
	const trackIndex = tracks.findIndex((storeTrack) => storeTrack.id === ranTrack.id);

	playTrackHelper(trackIndex);
};

/*
 * Play next track
 */
export const playNextTrack = (trackIndex) => {
	const queue = store.state.music.queue;

	// Check if there is a queue (serve queue first)
	if (queue.length > 0) {
		const newQueue = [...queue];
		let queuedTrackIndex;

		while (newQueue.length > 0 && queuedTrackIndex == null) {
			const trackId = newQueue.shift();
			queuedTrackIndex = store.state.music.tracksMap?.[trackId];
		}

		queueNew(newQueue);

		if (queuedTrackIndex != null) {
			return playTrackHelper(queuedTrackIndex);
		}
	}

	playTrackHelper(getNextTrack(trackIndex));
};

/*
 * Play previous track
 */
export const playPreviousTrack = (trackIndex) => {
	playTrackHelper(getPreviousTrack(trackIndex));
};

/*
 * Decide what to play based on current session
 */
export const playNextTrackBasedOnSession = (playNext = true) => {
	// If shuffle is on (and the queue is empty), play random track.
	if (store.state.session.actions.shuffle && !store.state.music.queue.length) {
		return playRandomTrack();
	}

	if (playNext) {
		playNextTrack(store.state.session.playing.index);
	} else {
		playPreviousTrack(store.state.session.playing.index);
	}
};

/*
 * Pause currently playing track
 */
export const playingTrackIsPaused = (isPaused) => {
	updateSlice("session", (session) => {
		if (!session.playing.track.id) return;
		session.playing.isPaused = isPaused;
	});
};

/*
 * Track unable to play; error
 */
export const playingTrackDidError = (playbackFailure = null) => {
	updateSlice("session", (session) => {
		session.playing = {
			...session.playing,
			didError: true,
			isPaused: true,
			playbackFailure: playbackFailure ?? session.playing.playbackFailure
		};
	});
};

/*
 * Record or clear a non-terminal playback failure.
 */
export const sessionUpdatePlaybackFailure = (playbackFailure) => {
	updateSlice("session", (session) => {
		session.playing.playbackFailure = playbackFailure;
	});
};

/*
 * Update status of playing track
 */
export const sessionUpdatePlayingStatus = (status) => {
	updateSlice("session", (session) => {
		session.playing.status = {
			...session.playing.status,
			...status
		};
	});
};

/*
 * Update html audio reference
 */
export const sessionUpdateAudioRef = (audioRef) => {
	updateSlice("session", (session) => {
		session.playing.audioRef = audioRef;
	});
};

/*
 * Change volume to an exact ammount (0/100)
 */
export const changeVolume = (newVolume) => {
	updateSlice("session", (session) => {
		localStorage.setItem("volume", JSON.stringify(newVolume));
		session.playing.status.volume = newVolume;
	});
};

/*
 * Mute volume - previous volume level is not effected
 */
export const muteVolume = (isMute: boolean) => {
	updateSlice("session", (session) => {
		session.playing.status.isMute = isMute;
	});
};

/*
 * Toggle shuffle
 */
export const shuffleToggle = () => {
	updateSlice("session", (session) => {
		session.actions.repeat = false;
		session.actions.shuffle = !session.actions.shuffle;
	});
};

/*
 * Toggle repeat
 */
export const repeatToggle = () => {
	updateSlice("session", (session) => {
		session.actions.shuffle = false;
		session.actions.repeat = !session.actions.repeat;
	});
};

/*
 * Toggle PIP - picture-in-picture
 */
export const pipToggle = () => {
	updateSlice("session", (session) => {
		session.actions.showPip = !session.actions.showPip;
	});
};

export const sessionClear = () => {
	updateSlice("session", (session) => {
		session = {
			...sessionStore,
			actions: {
				...session.actions
			},
			playing: {
				...sessionStore.playing,
				audioRef: session.playing.audioRef,
				status: {
					...sessionStore.playing.status,
					isMute: session.playing.status.isMute,
					volume: session.playing.status.volume
				}
			}
		};
	});
};
