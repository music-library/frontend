import { beforeEach, expect, test, vi } from "vitest";

const libMocks = vi.hoisted(() => ({
	getNextTrack: vi.fn((trackIndex) => trackIndex + 1),
	getPreviousTrack: vi.fn((trackIndex) => trackIndex - 1),
	socketSend: vi.fn()
}));

vi.mock("lib/index", () => libMocks);

import { QUEUE_NEW } from "state/slices/music/musicReducer";

import { playNextTrack, playTrack } from "./sessionActions";
import { SESSION_PLAY_TRACK } from "./sessionReducer";

const makeState = ({ queue, tracks, tracksMap }) => ({
	music: {
		didError: false,
		isFetching: false,
		queue,
		tracks,
		tracksMap
	}
});

beforeEach(() => {
	vi.clearAllMocks();
});

test("resolves a queued track ID to its current index after reindexing", () => {
	const dispatch = vi.fn();
	const state = makeState({
		queue: ["track-b"],
		tracks: [{ id: "track-a" }, { id: "track-b" }],
		tracksMap: { "track-a": 0, "track-b": 1 }
	});

	playNextTrack(0)(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith({ type: QUEUE_NEW, payload: [] });
	expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
		type: SESSION_PLAY_TRACK,
		payload: {
			trackIndex: 1,
			track: state.music.tracks[1]
		}
	}));
});

test("accepts a queued track that resolves to index zero", () => {
	const dispatch = vi.fn();
	const state = makeState({
		queue: ["track-a"],
		tracks: [{ id: "track-a" }],
		tracksMap: { "track-a": 0 }
	});

	playNextTrack(4)(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
		type: SESSION_PLAY_TRACK,
		payload: {
			trackIndex: 0,
			track: state.music.tracks[0]
		}
	}));
});

test("skips deleted IDs and plays the next valid queued track", () => {
	const dispatch = vi.fn();
	const state = makeState({
		queue: ["deleted-track", "track-a"],
		tracks: [{ id: "track-a" }],
		tracksMap: { "track-a": 0 }
	});

	playNextTrack(4)(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith({ type: QUEUE_NEW, payload: [] });
	expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
		type: SESSION_PLAY_TRACK,
		payload: {
			trackIndex: 0,
			track: state.music.tracks[0]
		}
	}));
});

test("manual playback removes the matching track ID from the queue", () => {
	const dispatch = vi.fn();
	const state = makeState({
		queue: ["track-b", "track-a"],
		tracks: [{ id: "track-a" }, { id: "track-b" }],
		tracksMap: { "track-a": 0, "track-b": 1 }
	});

	playTrack(1)(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith({
		type: QUEUE_NEW,
		payload: ["track-a"]
	});
});
