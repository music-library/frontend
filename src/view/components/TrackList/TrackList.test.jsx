import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const catalogMocks = vi.hoisted(() => ({
	getDistinctAlbumIds: (tracks) => [...new Set(tracks.map((track) => track.albumId))],
	isLoading: false,
	refresh: { isRefreshing: false, didError: false },
	useLibraryTracks: vi.fn(() => ({ data: [], isLoading: catalogMocks.isLoading })),
	useLibraryAlbums: vi.fn(() => ({ data: [] })),
	useCatalogRefreshState: vi.fn(() => catalogMocks.refresh),
	useAlbum: vi.fn(() => ({ data: undefined })),
	useAlbumTracks: vi.fn(() => ({ data: [] })),
	useTrack: vi.fn(() => ({ data: undefined }))
}));

vi.mock("catalog", () => catalogMocks);

import AlbumList from "./AlbumList";
import TrackList from "./TrackList";

const createState = () => ({
	music: {
		library: { selected: "main" },
		filter: { tags: [], search: "" }
	},
	session: { playing: { trackId: null, isPaused: false } },
	color: { colors: ["#ffffff"], current: 0 }
});

const renderWithState = (ui) => {
	const store = configureStore({ reducer: () => createState() });
	return render(
		<Provider store={store}>
			<MemoryRouter>{ui}</MemoryRouter>
		</Provider>
	);
};

beforeEach(() => {
	catalogMocks.isLoading = false;
	catalogMocks.refresh = { isRefreshing: false, didError: false };
});

afterEach(() => cleanup());

describe.each([
	["AlbumList", AlbumList],
	["TrackList", TrackList]
])("%s", (_name, List) => {
	test("renders loading placeholders while the empty catalog hydrates", () => {
		catalogMocks.isLoading = true;
		const { container } = renderWithState(<List />);
		expect(container.querySelectorAll(".loading").length).toBeGreaterThan(0);
		expect(container.querySelectorAll(".error")).toHaveLength(0);
	});

	test("retains the empty error presentation when refresh fails without cache", () => {
		catalogMocks.refresh = { isRefreshing: false, didError: true };
		const { container } = renderWithState(<List />);
		expect(container.querySelectorAll(".loading").length).toBeGreaterThan(0);
		expect(container.querySelectorAll(".error").length).toBeGreaterThan(0);
	});

	test("does not render placeholders after catalog hydration settles", () => {
		const { container } = renderWithState(<List />);
		expect(container.querySelectorAll(".loading")).toHaveLength(0);
		expect(container.querySelectorAll(".error")).toHaveLength(0);
	});
});
