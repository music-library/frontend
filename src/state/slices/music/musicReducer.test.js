import { beforeEach, expect, test, vi } from "vitest";

const loadReducer = async () => {
	const reducerModule = await import("./musicReducer");
	return reducerModule;
};

beforeEach(() => {
	localStorage.clear();
	vi.resetModules();
});

test("loads only valid track IDs from the versioned queue key", async () => {
	localStorage.setItem("queue/main", JSON.stringify([4, 8]));
	localStorage.setItem("queue/v2/main", JSON.stringify(["track-a", 3, "", "track-b"]));

	const { default: musicReducer } = await loadReducer();
	const state = musicReducer(undefined, { type: "@@INIT" });

	expect(state.queue).toEqual(["track-a", "track-b"]);
	expect(localStorage.getItem("queue/main")).toBe(JSON.stringify([4, 8]));
});

test("loads a separate stable-ID queue when switching libraries", async () => {
	localStorage.setItem("queue/v2/other", JSON.stringify(["other-track"]));

	const { LIBRARY_SWITCH, default: musicReducer } = await loadReducer();
	const initialState = musicReducer(undefined, { type: "@@INIT" });
	const state = musicReducer(initialState, {
		type: LIBRARY_SWITCH,
		payload: "other"
	});

	expect(state.library.selected).toBe("other");
	expect(state.queue).toEqual(["other-track"]);
});

test("persists stable IDs when pushing, removing, and reordering", async () => {
	const {
		QUEUE_NEW,
		QUEUE_PUSH,
		QUEUE_REMOVE,
		default: musicReducer
	} = await loadReducer();
	let state = musicReducer(undefined, { type: "@@INIT" });

	state = musicReducer(state, { type: QUEUE_PUSH, payload: "track-a" });
	state = musicReducer(state, { type: QUEUE_PUSH, payload: "track-b" });
	state = musicReducer(state, {
		type: QUEUE_NEW,
		payload: ["track-b", "track-a"]
	});
	state = musicReducer(state, { type: QUEUE_REMOVE, payload: "track-a" });

	expect(state.queue).toEqual(["track-b"]);
	expect(JSON.parse(localStorage.getItem("queue/v2/main"))).toEqual(["track-b"]);
});

test("preserves queued identities until catalog-backed playback resolves them", async () => {
	localStorage.setItem(
		"queue/v2/main",
		JSON.stringify(["track-b", "deleted-track", "track-a"])
	);

	const { default: musicReducer } = await loadReducer();
	const initialState = musicReducer(undefined, { type: "@@INIT" });
	const state = musicReducer(initialState, { type: "CATALOG_REFRESHED" });

	expect(state.queue).toEqual(["track-b", "deleted-track", "track-a"]);
	expect(JSON.parse(localStorage.getItem("queue/v2/main"))).toEqual([
		"track-b",
		"deleted-track",
		"track-a"
	]);
});
