import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

import Album from "./Album";

vi.mock("lib/hooks", () => ({
	useColor: () => "#ffffff"
}));

vi.mock("lib/index", () => ({
	api: () => ({
		getUri: ({ url }) => url
	}),
	getAlbum: () => ({
		album: "Album name",
		album_artist: "Album artist",
		idCover: "cover-id"
	})
}));

vi.mock("state/actions", () => ({
	playTrack: (track) => ({ payload: track, type: "play" }),
	playingTrackIsPaused: (isPaused) => ({ payload: isPaused, type: "pause" })
}));

vi.mock("view/components", () => ({
	Icon: () => <span>Play</span>,
	Image: ({ alt }) => <img alt={alt} />
}));

const state = {
	music: {
		didError: false,
		tracksMap: {
			"track-1": { id: "track-1" }
		}
	},
	session: {
		playing: {
			isPaused: false,
			track: {}
		}
	}
};

const renderAlbum = (props = {}) => {
	const store = configureStore({ reducer: () => state });

	return render(
		<Provider store={store}>
			<MemoryRouter>
				<Album albumId="album-1" albumTracks={["track-1"]} {...props} />
			</MemoryRouter>
		</Provider>
	);
};

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("album navigation capture", () => {
	test("captures an unmodified same-tab album navigation", () => {
		const onNavigate = vi.fn();
		renderAlbum({ onNavigate });

		fireEvent.click(screen.getByRole("link"));

		expect(onNavigate).toHaveBeenCalledOnce();
	});

	test.each([
		["control-click", { ctrlKey: true }],
		["command-click", { metaKey: true }],
		["shift-click", { shiftKey: true }],
		["alt-click", { altKey: true }],
		["middle-click", { button: 1 }]
	])("does not capture a %s", (name, eventInit) => {
		const onNavigate = vi.fn();
		renderAlbum({ onNavigate });

		fireEvent.click(screen.getByRole("link"), eventInit);

		expect(onNavigate).not.toHaveBeenCalled();
	});

	test("does not capture the play-button interaction", () => {
		const onNavigate = vi.fn();
		const { container } = renderAlbum({ onNavigate });

		fireEvent.click(container.querySelector(".album-action"));

		expect(onNavigate).not.toHaveBeenCalled();
	});

	test("does not capture a loading album placeholder", () => {
		const onNavigate = vi.fn();
		const store = configureStore({ reducer: () => state });

		render(
			<Provider store={store}>
				<MemoryRouter>
					<Album onNavigate={onNavigate} />
				</MemoryRouter>
			</Provider>
		);

		fireEvent.click(screen.getByRole("link"));

		expect(onNavigate).not.toHaveBeenCalled();
	});
});
