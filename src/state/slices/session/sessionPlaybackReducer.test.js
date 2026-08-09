import { beforeEach, describe, expect, test } from "vitest";

import sessionReducer, {
	SESSION_PLAYBACK_FAILURE,
	SESSION_PLAY_TRACK,
	SESSION_TRACK_ERROR
} from "./sessionReducer";

const failure = {
	kind: "network",
	trackId: "track-a",
	playErrorName: null,
	mediaErrorCode: 2,
	networkState: 2,
	readyState: 0,
	retryAttempt: 1
};

describe("session playback failures", () => {
	beforeEach(() => localStorage.clear());

	test("records a recoverable playback failure without marking the track failed", () => {
		const state = sessionReducer(undefined, {
			type: SESSION_PLAYBACK_FAILURE,
			payload: failure
		});

		expect(state.playing.playbackFailure).toEqual(failure);
		expect(state.playing.didError).toBe(false);
	});

	test("records terminal diagnostics and pauses playback", () => {
		const state = sessionReducer(undefined, {
			type: SESSION_TRACK_ERROR,
			payload: failure
		});

		expect(state.playing).toMatchObject({
			didError: true,
			isPaused: true,
			playbackFailure: failure
		});
	});

	test("clears playback diagnostics when a new track is selected", () => {
		const failedState = sessionReducer(undefined, {
			type: SESSION_TRACK_ERROR,
			payload: failure
		});
		const state = sessionReducer(failedState, {
			type: SESSION_PLAY_TRACK,
			payload: {
				trackIndex: 1,
				track: { id: "track-b", metadata: {} }
			}
		});

		expect(state.playing.playbackFailure).toBeNull();
		expect(state.playing.didError).toBe(false);
		expect(state.playing.isPaused).toBe(false);
	});
});
