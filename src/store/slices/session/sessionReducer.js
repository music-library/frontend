import { isMobile } from "react-device-detect";

import { parseJSON } from "utils";

export const SESSION_PLAY_TRACK = "SESSION_PLAY_TRACK";
export const SESSION_PLAYING_TOGGLE = "SESSION_PLAYING_TOGGLE";
export const SESSION_TRACK_ERROR = "SESSION_TRACK_ERROR";
export const SESSION_PLAYING_UPDATE_STATUS = "SESSION_PLAYING_UPDATE_STATUS";
export const SESSION_PLAYING_AUDIO_REF = "SESSION_PLAYING_AUDIO_REF";
export const SESSION_VOLUME = "SESSION_VOLUME";
export const SESSION_VOLUME_MUTE = "SESSION_VOLUME_MUTE";
export const SESSION_SHUFFLE_TOGGLE = "SESSION_SHUFFLE_TOGGLE";
export const SESSION_REPEAT_TOGGLE = "SESSION_REPEAT_TOGGLE";
export const SESSION_PIP_TOGGLE = "SESSION_PIP_TOGGLE";

// Initial state of app
const initialState = {
	actions: {
		shuffle: false,
		repeat: false,
		showPip: false // picture-in-picture
	},
	playing: {
		audioRef: {},
		didError: false,
		isPaused: true,
		status: {
			duration: null,
			position: null,
			isMute: false,
			volume: isMobile
				? 100
				: parseJSON(localStorage.getItem("volume")) || 50
		},
		index: -1,
		track: {
			id: null,
			id_album: null,
			metadata: {}
		}
	},
	selected: {}
};

const sessionReducer = (state = initialState, action) => {
	switch (action.type) {
		case SESSION_PLAY_TRACK:
			return {
				...state,
				playing: {
					...state.playing,
					didError: false,
					isPaused: false,
					index: parseInt(action.payload.trackIndex),
					track: action.payload.track
				}
			};

		case SESSION_PLAYING_TOGGLE:
			// Check if there is a track playing
			if (!state.playing.track.id) return state;

			return {
				...state,
				playing: {
					...state.playing,
					isPaused: action.payload
				}

			};

		case SESSION_TRACK_ERROR:
			return {
				...state,
				playing: {
					...state.playing,
					didError: true,
					isPaused: true
				}

			};

		case SESSION_PLAYING_UPDATE_STATUS:
			return {
				...state,
				playing: {
					...state.playing,
					status: {
						...state.playing.status,
						...action.payload
					}

				}
			};

		case SESSION_PLAYING_AUDIO_REF:
			return {
				...state,
				playing: {
					...state.playing,
					audioRef: action.payload
				}

			};

		case SESSION_VOLUME:
			localStorage.setItem("volume", action.payload);

			return {
				...state,
				playing: {
					...state.playing,
					status: {
						...state.playing.status,
						volume: action.payload
					}
				}

			};

		case SESSION_VOLUME_MUTE:
			return {
				...state,
				playing: {
					...state.playing,
					status: {
						...state.playing.status,
						isMute: action.payload
					}
				}

			};

		case SESSION_SHUFFLE_TOGGLE:
			return {
				...state,
				actions: {
					...state.actions,
					repeat: false,
					shuffle: !state.actions.shuffle
				}

			};

		case SESSION_REPEAT_TOGGLE:
			return {
				...state,
				actions: {
					...state.actions,
					shuffle: false,
					repeat: !state.actions.repeat

				}
			};

		case SESSION_PIP_TOGGLE:
			return {
				...state,
				actions: {
					...state.actions,
					showPip: !state.actions.showPip

				}
			};

		default:
			return state;
	}
};

export default sessionReducer;
