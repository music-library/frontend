import { configureStore } from "@reduxjs/toolkit";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import RandomSelection from "../RandomSelection";
import AlbumList from "./AlbumList";
import {
	albumScrollRestorations,
	getAlbumScrollRestoration,
	groupAlbumIdsIntoRows
} from "./AlbumList.utils";

vi.mock("@tanstack/react-virtual", () => ({
	useWindowVirtualizer: vi.fn()
}));

vi.mock("../Tracks/Album", () => ({
	default: ({ albumId }) => <div data-testid="album">{albumId}</div>
}));

const albumIds = [...Array(12)].map((x, index) => `album-${index}`);

const createState = () => ({
	music: {
		tracks: albumIds.map((albumId, index) => ({
			id: `track-${index}`,
			id_album: albumId,
			metadata: {}
		})),
		filter: {
			tags: [],
			search: ""
		},
		filteredData: [],
		albumsMap: Object.fromEntries(
			albumIds.map((albumId, index) => [albumId, [`track-${index}`]])
		),
		tracksMap: {},
		isFetching: false,
		didError: false
	},
	session: {
		playing: {
			track: {},
			isPaused: false
		}
	},
	color: {
		colors: ["#ffffff"],
		current: 0
	}
});

const createVirtualizer = () => ({
	getTotalSize: vi.fn(() => 1200),
	getVirtualItems: vi.fn(() => [
		{
			end: 600,
			index: 1,
			key: "row-1",
			size: 300,
			start: 300
		}
	]),
	measure: vi.fn(),
	measureElement: vi.fn(),
	scrollOffset: 350,
	scrollToIndex: vi.fn(),
	scrollToOffset: vi.fn(),
	takeSnapshot: vi.fn(() => [])
});

const renderWithState = (ui) => {
	const store = configureStore({
		reducer: () => createState()
	});

	return render(
		<Provider store={store}>
			<MemoryRouter>{ui}</MemoryRouter>
		</Provider>
	);
};

const renderAlbumList = () => renderWithState(<AlbumList />);

beforeEach(() => {
	albumScrollRestorations.clear();
	useWindowVirtualizer.mockImplementation(createVirtualizer);
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("responsive album rows", () => {
	test("groups complete and partial rows at each column count", () => {
		expect(groupAlbumIdsIntoRows(albumIds.slice(0, 7), 2)).toEqual([
			["album-0", "album-1"],
			["album-2", "album-3"],
			["album-4", "album-5"],
			["album-6"]
		]);
		expect(groupAlbumIdsIntoRows(albumIds.slice(0, 7), 5)).toEqual([
			["album-0", "album-1", "album-2", "album-3", "album-4"],
			["album-5", "album-6"]
		]);
	});

	test("renders albums only for rows supplied by the virtualizer", () => {
		renderAlbumList();

		expect(useWindowVirtualizer).toHaveBeenCalledWith(
			expect.objectContaining({
				count: 4,
				overscan: 2
			})
		);
		expect(screen.getAllByTestId("album").map((album) => album.textContent)).toEqual([
			"album-3",
			"album-4",
			"album-5"
		]);
	});

	test("scopes block layout to the virtualized Albums grid", () => {
		const { container } = renderAlbumList();

		expect(container.querySelector(".grid-albums")).toHaveClass(
			"album-grid-virtualized"
		);
	});

	test("keeps the Home album selection on the standard responsive grid", () => {
		const { container } = renderWithState(<RandomSelection />);
		const homeGrid = container.querySelector(".grid-albums");

		expect(homeGrid).toHaveClass("track-container", "grid", "grid-albums");
		expect(homeGrid).not.toHaveClass("album-grid-virtualized");
	});
});

describe("album scroll restoration", () => {
	const saved = {
		albumIds,
		anchorAlbumId: "album-6",
		anchorAlbumIndex: 6,
		columns: 3,
		offsetTop: 240,
		offsetWithinRow: 24,
		scrollOffset: 1800,
		viewportWidth: 1024,
		width: 900
	};

	test("restores the exact offset for a matching history entry", () => {
		expect(
			getAlbumScrollRestoration({
				saved,
				navigationType: "POP",
				albumIds,
				columns: 3,
				viewportWidth: 1024
			})
		).toEqual({ mode: "offset", offset: 1800 });
	});

	test("starts at the top for a fresh navigation", () => {
		expect(
			getAlbumScrollRestoration({
				saved,
				navigationType: "PUSH",
				albumIds,
				columns: 3,
				viewportWidth: 1024
			})
		).toEqual({ mode: "top" });
	});

	test("uses the saved album as an anchor after a responsive layout change", () => {
		expect(
			getAlbumScrollRestoration({
				saved,
				navigationType: "POP",
				albumIds,
				columns: 2,
				viewportWidth: 700
			})
		).toEqual({ mode: "anchor", rowIndex: 3, offsetWithinRow: 24 });
	});

	test("uses the saved album as an anchor when the grid geometry changes", () => {
		expect(
			getAlbumScrollRestoration({
				saved,
				navigationType: "POP",
				albumIds,
				columns: 3,
				viewportWidth: 1024,
				gridWidth: 860,
				offsetTop: 240
			})
		).toEqual({ mode: "anchor", rowIndex: 2, offsetWithinRow: 24 });
	});

	test("falls back to the nearest valid row when the anchor album is missing", () => {
		const filteredAlbumIds = albumIds.slice(0, 5);

		expect(
			getAlbumScrollRestoration({
				saved,
				navigationType: "POP",
				albumIds: filteredAlbumIds,
				columns: 2,
				viewportWidth: 700
			})
		).toEqual({ mode: "anchor", rowIndex: 2, offsetWithinRow: 24 });
	});

	test("falls back to the top for an empty library", () => {
		expect(
			getAlbumScrollRestoration({
				saved,
				navigationType: "POP",
				albumIds: [],
				columns: 2,
				viewportWidth: 700
			})
		).toEqual({ mode: "top" });
	});
});
