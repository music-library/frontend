import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, test, vi } from "vitest";

import sessionReducer from "state/slices/session/sessionReducer";

import Sound from "./Sound";

const audioMock = vi.hoisted(() => ({
	props: null,
	ref: {
		current: {
			currentTime: 0,
			duration: 120,
			error: null,
			load: vi.fn(),
			loop: false,
			networkState: 2,
			pause: vi.fn(),
			play: vi.fn(),
			readyState: 0,
			volume: 1
		}
	}
}));

vi.mock("lib/hooks", () => ({
	useAudio: vi.fn((props) => {
		audioMock.props = props;
		return [null, {}, {}, audioMock.ref];
	})
}));

vi.mock("lib/index", () => ({
	api: () => ({ getUri: ({ url }) => url }),
	getNextTrack: vi.fn((index) => index + 1),
	getPreviousTrack: vi.fn((index) => index - 1),
	socketSend: vi.fn()
}));

const track = { id: "track-a", metadata: {} };

const makeStore = () => {
	const store = configureStore({
		reducer: { session: sessionReducer },
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				immutableCheck: false,
				serializableCheck: false
			})
	});
	store.dispatch({
		type: "SESSION_PLAY_TRACK",
		payload: { trackId: track.id }
	});
	return store;
};

const renderSound = ({
	store = makeStore(),
	currentTrack = track,
	isPaused = false,
	onFinishedPlaying = vi.fn(),
	onPlaying = vi.fn()
} = {}) => {
	const view = render(
		<Provider store={store}>
			<Sound
				track={currentTrack}
				isPaused={isPaused}
				loop={false}
				volume={75}
				onFinishedPlaying={onFinishedPlaying}
				onPlaying={onPlaying}
			/>
		</Provider>
	);

	return { ...view, store, onFinishedPlaying, onPlaying };
};

const domException = (name) => new DOMException(name, name);

describe("mobile audio handoff", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		audioMock.props = null;
		audioMock.ref.current.error = null;
		audioMock.ref.current.networkState = 2;
		audioMock.ref.current.readyState = 0;
		audioMock.ref.current.load.mockReset();
		audioMock.ref.current.pause.mockReset();
		audioMock.ref.current.play.mockReset().mockResolvedValue(undefined);
		vi.spyOn(console, "error").mockImplementation(() => {});

		const handlers = {};
		Object.defineProperty(navigator, "mediaSession", {
			configurable: true,
			value: {
				handlers,
				playbackState: "none",
				setActionHandler: vi.fn((name, handler) => {
					handlers[name] = handler;
				})
			}
		});
	});

	test("awaits the handoff and synchronizes successful playback", async () => {
		const { store } = renderSound();

		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(1));
		act(() => audioMock.props.onPlaying({ currentTarget: audioMock.ref.current }));

		expect(store.getState().session.playing.playbackFailure).toBeNull();
		expect(store.getState().session.playing.isPaused).toBe(false);
		expect(navigator.mediaSession.playbackState).toBe("playing");
	});

	test("synchronizes paused and unmounted Media Session state", () => {
		const { unmount } = renderSound({ isPaused: true });

		expect(audioMock.ref.current.pause).toHaveBeenCalledTimes(1);
		expect(navigator.mediaSession.playbackState).toBe("paused");

		unmount();
		expect(navigator.mediaSession.playbackState).toBe("none");
	});

	test("shows tap to resume only for NotAllowedError and resumes directly", async () => {
		audioMock.ref.current.play.mockRejectedValueOnce(domException("NotAllowedError"));
		const { store } = renderSound();

		const resumeButton = await screen.findByRole("button", {
			name: "Tap to resume audio"
		});
		expect(audioMock.ref.current.load).not.toHaveBeenCalled();
		expect(store.getState().session.playing.playbackFailure).toMatchObject({
			kind: "autoplay-blocked",
			trackId: "track-a",
			playErrorName: "NotAllowedError",
			networkState: 2,
			readyState: 0
		});

		audioMock.ref.current.play.mockResolvedValueOnce(undefined);
		fireEvent.click(resumeButton);
		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(2));
		act(() => audioMock.props.onPlaying({ currentTarget: audioMock.ref.current }));
		await waitFor(() =>
			expect(
				screen.queryByRole("button", { name: "Tap to resume audio" })
			).not.toBeInTheDocument()
		);
	});

	test("retries an active abort once and records a second failure", async () => {
		audioMock.ref.current.play
			.mockRejectedValueOnce(domException("AbortError"))
			.mockRejectedValueOnce(domException("AbortError"));
		const { store } = renderSound();

		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(2));
		expect(audioMock.ref.current.load).toHaveBeenCalledTimes(1);
		expect(store.getState().session.playing).toMatchObject({
			didError: true,
			isPaused: true,
			playbackFailure: {
				kind: "aborted",
				playErrorName: "AbortError",
				retryAttempt: 1
			}
		});
		expect(
			screen.queryByRole("button", { name: "Tap to resume audio" })
		).not.toBeInTheDocument();
	});

	test("retries a media network error once and clears it when playing", async () => {
		const { store } = renderSound();
		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(1));

		audioMock.ref.current.error = { code: 2 };
		act(() => {
			audioMock.props.onError({ currentTarget: audioMock.ref.current });
		});

		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(2));
		expect(audioMock.ref.current.load).toHaveBeenCalledTimes(1);
		expect(store.getState().session.playing.playbackFailure).toMatchObject({
			kind: "network",
			mediaErrorCode: 2,
			retryAttempt: 1
		});

		act(() => audioMock.props.onPlaying({ currentTarget: audioMock.ref.current }));
		expect(store.getState().session.playing.playbackFailure).toBeNull();
	});

	test.each([
		[3, "decode"],
		[4, "unsupported"]
	])("does not retry terminal media error %s", async (code, kind) => {
		const { store } = renderSound();
		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(1));

		audioMock.ref.current.error = { code };
		act(() => {
			audioMock.props.onError({ currentTarget: audioMock.ref.current });
		});

		await waitFor(() => expect(store.getState().session.playing.didError).toBe(true));
		expect(audioMock.ref.current.load).not.toHaveBeenCalled();
		expect(store.getState().session.playing.playbackFailure.kind).toBe(kind);
		expect(
			screen.queryByRole("button", { name: "Tap to resume audio" })
		).not.toBeInTheDocument();
	});

	test("ignores a late rejection from a superseded track", async () => {
		let rejectFirstPlay;
		audioMock.ref.current.play
			.mockImplementationOnce(
				() =>
					new Promise((resolve, reject) => {
						rejectFirstPlay = reject;
					})
			)
			.mockResolvedValueOnce(undefined);
		const store = makeStore();
		const onFinishedPlaying = vi.fn();
		const onPlaying = vi.fn();
		const { rerender } = renderSound({ store, onFinishedPlaying, onPlaying });
		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(1));

		rerender(
			<Provider store={store}>
				<Sound
					track={{ id: "track-b", metadata: {} }}
					isPaused={false}
					loop={false}
					volume={75}
					onFinishedPlaying={onFinishedPlaying}
					onPlaying={onPlaying}
				/>
			</Provider>
		);
		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(2));

		await act(async () => rejectFirstPlay(domException("NotAllowedError")));
		expect(store.getState().session.playing.playbackFailure).toBeNull();
	});

	test("wires Media Session controls to the real audio element", async () => {
		const { store, onFinishedPlaying } = renderSound();
		await waitFor(() =>
			expect(navigator.mediaSession.handlers.play).toBeTypeOf("function")
		);

		act(() => navigator.mediaSession.handlers.pause());
		expect(audioMock.ref.current.pause).toHaveBeenCalled();
		expect(store.getState().session.playing.isPaused).toBe(true);
		expect(navigator.mediaSession.playbackState).toBe("paused");

		act(() => navigator.mediaSession.handlers.play());
		await waitFor(() => expect(audioMock.ref.current.play).toHaveBeenCalledTimes(2));

		act(() => audioMock.props.onEnded());
		expect(onFinishedPlaying).toHaveBeenCalledTimes(1);
	});
});
