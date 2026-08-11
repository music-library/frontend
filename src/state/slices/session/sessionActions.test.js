import { beforeEach, expect, test, vi } from "vitest";

const catalogMocks = vi.hoisted(() => ({
	getOrderedTracks: vi.fn(),
	getTrack: vi.fn(),
	updateTrackStats: vi.fn()
}));

const libMocks = vi.hoisted(() => ({ socketSend: vi.fn() }));

vi.mock("catalog", () => catalogMocks);
vi.mock("lib/index", () => libMocks);

import { QUEUE_NEW } from "state/slices/music/musicReducer";

import {
	playNextTrack,
	playPreviousTrack,
	playRandomTrack,
	playTrack
} from "./sessionActions";
import { SESSION_PLAY_TRACK } from "./sessionReducer";

const tracks = [{ id: "track-a" }, { id: "track-b" }];
const makeState = (queue) => ({
	music: {
		library: { selected: "main" },
		filter: { tags: [], search: "" },
		queue
	}
});

beforeEach(() => {
	vi.clearAllMocks();
	catalogMocks.getOrderedTracks.mockResolvedValue(tracks);
	catalogMocks.getTrack.mockImplementation((_libraryId, trackId) =>
		tracks.find((track) => track.id === trackId)
	);
});

test("plays a queued stable track ID after catalog reordering", async () => {
	const dispatch = vi.fn();
	const state = makeState(["track-b"]);

	await playNextTrack("track-a")(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith({ type: QUEUE_NEW, payload: [] });
	expect(dispatch).toHaveBeenCalledWith({
		type: SESSION_PLAY_TRACK,
		payload: { trackId: "track-b" }
	});
});

test("accepts a queued track that is first in catalog order", async () => {
	const dispatch = vi.fn();
	const state = makeState(["track-a"]);

	await playNextTrack("track-b")(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith({
		type: SESSION_PLAY_TRACK,
		payload: { trackId: "track-a" }
	});
});

test("skips deleted IDs and plays the next valid queued track", async () => {
	const dispatch = vi.fn();
	const state = makeState(["deleted-track", "track-a"]);

	await playNextTrack("track-b")(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith({ type: QUEUE_NEW, payload: ["track-a"] });
	expect(dispatch).toHaveBeenCalledWith({ type: QUEUE_NEW, payload: [] });
	expect(dispatch).toHaveBeenCalledWith({
		type: SESSION_PLAY_TRACK,
		payload: { trackId: "track-a" }
	});
});

test("manual playback removes the matching track ID from the queue", () => {
	const dispatch = vi.fn();
	const state = makeState(["track-b", "track-a"]);

	playTrack("track-b")(dispatch, () => state);

	expect(dispatch).toHaveBeenCalledWith({
		type: QUEUE_NEW,
		payload: ["track-a"]
	});
	expect(dispatch).toHaveBeenCalledWith({
		type: SESSION_PLAY_TRACK,
		payload: { trackId: "track-b" }
	});
	expect(catalogMocks.updateTrackStats).toHaveBeenCalledWith("main", "track-b");
});

test("wraps next and previous playback in persisted API order", async () => {
	const dispatch = vi.fn();
	const state = makeState([]);

	await playNextTrack("track-b")(dispatch, () => state);
	await playPreviousTrack("track-a")(dispatch, () => state);

	expect(dispatch).toHaveBeenNthCalledWith(1, {
		type: SESSION_PLAY_TRACK,
		payload: { trackId: "track-a" }
	});
	expect(dispatch).toHaveBeenNthCalledWith(2, {
		type: SESSION_PLAY_TRACK,
		payload: { trackId: "track-b" }
	});
});

test("random playback uses tag-filtered catalog tracks but ignores text search", async () => {
	const dispatch = vi.fn();
	const state = makeState([]);
	state.music.filter = { tags: ["Rock", "1990"], search: "not applied" };
	vi.spyOn(Math, "random").mockReturnValue(0.75);

	await playRandomTrack()(dispatch, () => state);

	expect(catalogMocks.getOrderedTracks).toHaveBeenCalledWith(
		"main",
		["Rock", "1990"]
	);
	expect(dispatch).toHaveBeenCalledWith({
		type: SESSION_PLAY_TRACK,
		payload: { trackId: "track-b" }
	});
});
