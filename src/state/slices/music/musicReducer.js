import { parseJSON } from "lib/strings";

export const LIBRARY_SWITCH = "LIBRARY_SWITCH";
export const LIBRARY_FETCH_START = "LIBRARY_FETCH_START";
export const LIBRARY_FETCH_SUCCESS = "LIBRARY_FETCH_SUCCESS";
export const LIBRARY_FETCH_FAILURE = "LIBRARY_FETCH_FAILURE";

export const TRACK_STAT_UPDATE = "TRACK_STAT_UPDATE";

export const QUEUE_REMOVE = "QUEUE_REMOVE";
export const QUEUE_PUSH = "QUEUE_PUSH";
export const QUEUE_NEW = "QUEUE_NEW";

export const UPDATE_USER_SEARCH = "UPDATE_USER_SEARCH";
export const FILTER_TOGGLE_TAG = "FILTER_TOGGLE_TAG";
export const FILTER_RESET_TAGS = "FILTER_RESET_TAGS";

const initialSelectedLibrary = localStorage.getItem("library/selected") || "main";
const getQueueStorageKey = (library) => `queue/v2/${library}`;
const isTrackId = (trackId) => typeof trackId === "string" && trackId.length > 0;
const getQueue = (library = initialSelectedLibrary) => {
	const queue = parseJSON(localStorage.getItem(getQueueStorageKey(library)));
	return Array.isArray(queue) ? queue.filter(isTrackId) : [];
};
const persistQueue = (library, queue) => {
	localStorage.setItem(getQueueStorageKey(library), JSON.stringify(queue));
};

// Initial state of app
const initialState = {
	didError: false,
	isFetching: true,
	library: {
		selected: initialSelectedLibrary,
		options: parseJSON(localStorage.getItem("library/options")) || [{
			"id": "main",
			"name": "Main"
		}],
	},
	queue: getQueue(initialSelectedLibrary),
	filter: {
		tags: [],
		search: ""
	},
	filteredData: [],
	tracks: [],
	tracksMap: {},
	albumsMap: {},
	decades: [],
	genres: [],
};

const musicReducer = (state = initialState, action) => {
	switch (action.type) {
		case LIBRARY_SWITCH:
			// Skip if already selected
			if (state.library.selected === action.payload) return { ...state };

			const libraryQueue = getQueue(action.payload);
			localStorage.setItem("library/selected", action.payload);

			return {
				...state,
				didError: false,
				isFetching: true,
				library: {
					...state.library,
					selected: action.payload,
				},
				// Clear all lib data
				queue: libraryQueue,
				filter: {
					tags: [],
					search: ""
				},
				filteredData: [],
				tracks: [],
				tracksMap: {},
				albumsMap: {},
				decades: [],
				genres: [],
			};

		case LIBRARY_FETCH_START:
			return {
				...state,
				didError: false,
				isFetching: true,
			};

		case LIBRARY_FETCH_SUCCESS:
			const tracksMap = action.payload?.tracks_map || {};
			const validQueue = state.queue.filter((trackId) => (
				Object.prototype.hasOwnProperty.call(tracksMap, trackId)
			));

			try {
				localStorage.setItem("library/options", JSON.stringify(action.payload?.libraries));
				persistQueue(state.library.selected, validQueue);

				if (!localStorage.getItem("library/selected")) {
					localStorage.setItem("library/selected", action.payload?.libraries?.[0].id || "main");
				}
			} catch (e) {
				console.error('[LIBRARY_FETCH_SUCCESS] storage error', e);
			}

			return {
				...state,
				didError: false,
				isFetching: false,
				library: {
					...state.library,
					options: action.payload?.libraries,
				},
				tracks: action.payload?.tracks,
				queue: validQueue,
				tracksMap,
				albumsMap: action.payload?.albums,
				decades: action.payload?.decades,
				genres: action.payload?.genres,
			};

		case LIBRARY_FETCH_FAILURE:
			return {
				...state,
				didError: true,
				isFetching: false
			};

		case TRACK_STAT_UPDATE:
			// Update track stats
			// * Last played timestamp
			// * Times played count
			const newData = [...state.tracks];
			newData[action.payload] = {
				...newData[action.payload],
				stats: {
					...newData[action.payload].stats,
					lastPlayed: Date.now(),
					timesPlayed: newData[action.payload].stats.timesPlayed + 1
				}
			};

			return {
				...state,
				tracks: newData
			};

		case QUEUE_REMOVE:
			const queueWithoutTrack = state.queue.filter(
				(trackId) => trackId !== action.payload
			);
			persistQueue(state.library.selected, queueWithoutTrack);

			return {
				...state,
				queue: queueWithoutTrack
			};

		case QUEUE_PUSH:
			const queueWithTrack = [...state.queue, action.payload];
			persistQueue(state.library.selected, queueWithTrack);

			return {
				...state,
				queue: queueWithTrack
			};

		case QUEUE_NEW:
			const newQueue = action.payload.filter(isTrackId);
			persistQueue(state.library.selected, newQueue);

			return {
				...state,
				queue: newQueue
			};

		case UPDATE_USER_SEARCH:
			return {
				...state,
				filter: {
					...state.filter,
					search: action.payload
				}
			};

		case FILTER_TOGGLE_TAG:
			return {
				...state,
				filter: {
					...state.filter,
					tags: action.payload.tags
				},
				filteredData: action.payload.filteredData
			};

		case FILTER_RESET_TAGS:
			return {
				...state,
				filter: {
					...state.filter,
					tags: []
				},
				filteredData: []
			};

		default:
			return state;
	}
};

export default musicReducer;
