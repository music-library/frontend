import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import AlbumList from "./AlbumList";
import TrackList from "./TrackList";

const createState = ({ isFetching = false, didError = false } = {}) => ({
	music: {
		tracks: [],
		filter: {
			tags: [],
			search: ""
		},
		filteredData: [],
		albumsMap: {},
		tracksMap: {},
		isFetching,
		didError
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

const renderWithState = (ui, state) => {
	const store = configureStore({
		reducer: () => state
	});

	return render(
		<Provider store={store}>
			<MemoryRouter>{ui}</MemoryRouter>
		</Provider>
	);
};

afterEach(() => {
	cleanup();
});

describe.each([
	["AlbumList", AlbumList],
	["TrackList", TrackList]
])("%s", (name, List) => {
	test("renders loading placeholders while music is fetching", () => {
		const { container } = renderWithState(<List />, createState({ isFetching: true }));

		expect(container.querySelectorAll(".loading").length).toBeGreaterThan(0);
		expect(container.querySelectorAll(".error")).toHaveLength(0);
	});

	test("renders error placeholders when the music request fails", () => {
		const { container } = renderWithState(<List />, createState({ didError: true }));

		expect(container.querySelectorAll(".loading").length).toBeGreaterThan(0);
		expect(container.querySelectorAll(".error").length).toBeGreaterThan(0);
	});

	test("does not render placeholders after the music request settles", () => {
		const { container } = renderWithState(<List />, createState());

		expect(container.querySelectorAll(".loading")).toHaveLength(0);
		expect(container.querySelectorAll(".error")).toHaveLength(0);
	});
});
