import { configureStore } from "@reduxjs/toolkit";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useEffect, useReducer } from "react";
import { Provider } from "react-redux";
import { Link, MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const catalogMocks = vi.hoisted(() => ({
	tracks: [],
	albums: []
}));

vi.mock("catalog", () => ({
	getDistinctAlbumIds: (tracks) => [...new Set(tracks.map((track) => track.albumId))],
	useCatalogRefreshState: () => ({ isRefreshing: false, didError: false }),
	useLibraryAlbums: () => ({ data: catalogMocks.albums }),
	useLibraryTracks: (_libraryId, options = {}) => {
		let data = catalogMocks.tracks;
		if (options.tags?.length) {
			const genres = options.tags.filter((tag) => !/^\d{4}$/.test(tag));
			const decades = options.tags.filter((tag) => /^\d{4}$/.test(tag));
			data = data.filter((track) =>
				(!genres.length || genres.includes(track.genre)) &&
				(!decades.length || decades.includes(track.decade))
			);
		}
		if (options.includeSearch && options.search) {
			const search = options.search.toLowerCase();
			data = data.filter((track) => track.title.toLowerCase().includes(search));
		}
		return { data, isLoading: false };
	}
}));

import RandomSelection from "../RandomSelection";
import AlbumList from "./AlbumList";
import {
	albumScrollRestorations,
	getAlbumScrollRestoration,
	groupAlbumIdsIntoRows,
	rememberAlbumScroll
} from "./AlbumList.utils";

vi.mock("@tanstack/react-virtual", () => ({
	useWindowVirtualizer: vi.fn()
}));

vi.mock("../Tracks/Album", () => ({
	default: ({ albumId, onNavigate }) => (
		<Link
			data-testid="album"
			onClick={() => {
				if (albumId) onNavigate?.();
			}}
			to={albumId ? `/albums/${albumId}` : "#"}
		>
			{albumId}
		</Link>
	)
}));

const albumIds = [...Array(12)].map((x, index) => `album-${index}`);
const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");

const createState = () => ({
	music: {
		library: { selected: "main" },
		filter: {
			tags: [],
			search: ""
		},
		queue: []
	},
	session: {
		playing: {
			trackId: null,
			isPaused: false
		}
	},
	color: {
		colors: ["#ffffff"],
		current: 0
	}
});

const measuredRows = [
	{
		end: 600,
		index: 1,
		key: "row-1",
		lane: 0,
		size: 300,
		start: 300
	}
];

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
	scrollToIndex: vi.fn((index) => window.scrollTo(0, index * 300)),
	scrollToOffset: vi.fn((offset) => window.scrollTo(0, offset)),
	takeSnapshot: vi.fn(() => measuredRows)
});

const renderWithState = (ui, routerProps = {}, reducer = () => createState()) => {
	const store = configureStore({
		reducer
	});

	return {
		store,
		...render(
			<Provider store={store}>
				<MemoryRouter {...routerProps}>{ui}</MemoryRouter>
			</Provider>
		)
	};
};

const createUpdatableStateReducer =
	() =>
	(state = createState(), action) => {
		if (action.type !== "test/update-music") return state;

		return {
			...state,
			music: {
				...state.music,
				...action.payload
			}
		};
	};

const renderAlbumList = () => renderWithState(<AlbumList />);

function AlbumDetailRoute() {
	const navigate = useNavigate();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return <button onClick={() => navigate(-1)}>Back</button>;
}

beforeEach(() => {
	albumScrollRestorations.clear();
	catalogMocks.tracks = albumIds.map((albumId, index) => ({
		id: `track-${index}`,
		albumId,
		title: `Track ${index}`,
		genre: "",
		decade: ""
	}));
	catalogMocks.albums = albumIds.map((id) => ({ id }));
	useWindowVirtualizer.mockImplementation(createVirtualizer);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.clearAllMocks();
	Object.defineProperty(window, "scrollY", originalScrollY);
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
				overscan: 2,
				useFlushSync: false
			})
		);
		expect(screen.getAllByTestId("album").map((album) => album.textContent)).toEqual([
			"album-3",
			"album-4",
			"album-5"
		]);
	});

	test("updates albums when a stable virtualizer changes its visible rows", async () => {
		let virtualItems = [
			{
				end: 300,
				index: 0,
				key: "row-0",
				size: 300,
				start: 0
			}
		];
		const virtualizer = createVirtualizer();
		virtualizer.getVirtualItems.mockImplementation(() => virtualItems);
		let updateVirtualItems;

		useWindowVirtualizer.mockImplementation(() => {
			const [, rerender] = useReducer((count) => count + 1, 0);
			updateVirtualItems = (nextVirtualItems) => {
				virtualItems = nextVirtualItems;
				rerender();
			};
			return virtualizer;
		});

		renderAlbumList();

		expect(screen.getAllByTestId("album").map((album) => album.textContent)).toEqual([
			"album-0",
			"album-1",
			"album-2"
		]);

		act(() => {
			updateVirtualItems([
				{
					end: 900,
					index: 2,
					key: "row-2",
					size: 300,
					start: 600
				}
			]);
		});

		await waitFor(() => {
			expect(
				screen.getAllByTestId("album").map((album) => album.textContent)
			).toEqual(["album-6", "album-7", "album-8"]);
		});
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

	test("captures before album navigation and restores through Strict Mode cleanup", async () => {
		let scrollY = 0;
		const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation((x, y) => {
			scrollY = typeof x === "object" ? x.top : y;
		});
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
			callback();
			return 1;
		});
		vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
		vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
			() => ({
				bottom: 1440 - scrollY,
				height: 1200,
				left: 0,
				right: 900,
				top: 240 - scrollY,
				width: 900,
				x: 0,
				y: 240 - scrollY,
				toJSON: () => ({})
			})
		);
		Object.defineProperty(window, "scrollY", {
			configurable: true,
			get: () => scrollY
		});

		renderWithState(
			<React.StrictMode>
				<Routes>
					<Route path="/albums" element={<AlbumList />} />
					<Route path="/albums/:id" element={<AlbumDetailRoute />} />
				</Routes>
			</React.StrictMode>,
			{
				initialEntries: [{ key: "albums-entry", pathname: "/albums" }]
			}
		);

		scrollY = 350;
		fireEvent.click(screen.getByText("album-3"), { button: 0 });

		expect(scrollY).toBe(0);
		expect(albumScrollRestorations.get("albums-entry")).toEqual(
			expect.objectContaining({
				measurements: measuredRows,
				scrollOffset: 350
			})
		);

		fireEvent.click(screen.getByRole("button", { name: "Back" }));

		await waitFor(() => {
			expect(useWindowVirtualizer).toHaveBeenLastCalledWith(
				expect.objectContaining({
					initialMeasurementsCache: measuredRows,
					initialOffset: 350
				})
			);
			expect(scrollY).toBe(350);
		});

		expect(scrollTo).toHaveBeenCalledWith(0, 0);
	});

	test("applies an anchor's intra-row offset before animation-frame reconciliation", async () => {
		let scrollY = 0;
		vi.spyOn(window, "scrollTo").mockImplementation((x, y) => {
			scrollY = typeof x === "object" ? x.top : y;
		});
		vi.spyOn(window, "scrollBy").mockImplementation((x, y) => {
			scrollY += typeof x === "object" ? x.top : y;
		});
		vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
		vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
		vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
			() => ({
				bottom: 1440 - scrollY,
				height: 1200,
				left: 0,
				right: 900,
				top: 240 - scrollY,
				width: 900,
				x: 0,
				y: 240 - scrollY,
				toJSON: () => ({})
			})
		);
		Object.defineProperty(window, "scrollY", {
			configurable: true,
			get: () => scrollY
		});
		rememberAlbumScroll("albums-entry", {
			albumIds,
			anchorAlbumId: "album-3",
			anchorAlbumIndex: 3,
			columns: 3,
			measurements: measuredRows,
			offsetTop: 240,
			offsetWithinRow: 50,
			scrollOffset: 350,
			viewportWidth: window.innerWidth,
			width: 800
		});

		renderWithState(<AlbumList />, {
			initialEntries: [{ key: "albums-entry", pathname: "/albums" }]
		});

		await waitFor(() => expect(scrollY).toBe(350));
		expect(
			useWindowVirtualizer.mock.results.at(-1).value.scrollToIndex
		).toHaveBeenCalledWith(1, {
			align: "start",
			behavior: "auto"
		});
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

describe("album filter scrolling", () => {
	const setWindowScrollPosition = (initialScrollY) => {
		let scrollY = initialScrollY;
		const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation((x, y) => {
			scrollY = typeof x === "object" ? x.top : y;
		});
		Object.defineProperty(window, "scrollY", {
			configurable: true,
			get: () => scrollY
		});

		return {
			getScrollY: () => scrollY,
			scrollTo
		};
	};

	test("preserves the window offset when tags are selected and reset", async () => {
		const virtualizer = createVirtualizer();
		useWindowVirtualizer.mockReturnValue(virtualizer);
		const { getScrollY, scrollTo } = setWindowScrollPosition(0);
		const { store } = renderWithState(
			<AlbumList />,
			{},
			createUpdatableStateReducer()
		);
		catalogMocks.tracks = catalogMocks.tracks.map((track, index) => ({
			...track,
			genre: index < 6 ? "Rock" : "Jazz"
		}));

		window.scrollTo(0, 350);
		scrollTo.mockClear();
		virtualizer.scrollToOffset.mockClear();

		act(() => {
			store.dispatch({
				type: "test/update-music",
				payload: {
					filter: { search: "", tags: ["Rock"] }
				}
			});
		});

		await waitFor(() => expect(virtualizer.measure).toHaveBeenCalledTimes(1));
		expect(virtualizer.scrollToOffset).not.toHaveBeenCalled();
		expect(scrollTo).not.toHaveBeenCalled();
		expect(getScrollY()).toBe(350);

		act(() => {
			store.dispatch({
				type: "test/update-music",
				payload: {
					filter: { search: "", tags: [] }
				}
			});
		});

		await waitFor(() => expect(virtualizer.measure).toHaveBeenCalledTimes(2));
		expect(virtualizer.scrollToOffset).not.toHaveBeenCalled();
		expect(scrollTo).not.toHaveBeenCalled();
		expect(getScrollY()).toBe(350);
	});

	test("resets the window offset when search changes the albums", async () => {
		const virtualizer = createVirtualizer();
		virtualizer.getVirtualItems.mockReturnValue([
			{
				end: 300,
				index: 0,
				key: "row-0",
				size: 300,
				start: 0
			}
		]);
		useWindowVirtualizer.mockReturnValue(virtualizer);
		const { getScrollY } = setWindowScrollPosition(0);
		const { store } = renderWithState(
			<AlbumList />,
			{},
			createUpdatableStateReducer()
		);

		window.scrollTo(0, 350);
		virtualizer.scrollToOffset.mockClear();

		act(() => {
			store.dispatch({
				type: "test/update-music",
				payload: {
					filter: { search: "0", tags: [] }
				}
			});
		});

		await waitFor(() => {
			expect(virtualizer.scrollToOffset).toHaveBeenCalledWith(0, {
				behavior: "auto"
			});
		});
		expect(getScrollY()).toBe(0);
	});
});
