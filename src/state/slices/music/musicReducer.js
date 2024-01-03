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
const getQueue = (library = initialSelectedLibrary) => parseJSON(localStorage.getItem(`queue/${library}`)) || [];

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
	queue: getQueue(initialSelectedLibrary), // [45, 49, 71, 94],
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
			try {
				localStorage.setItem("library/options", JSON.stringify(action.payload?.libraries));

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
				tracksMap: action.payload?.tracks_map,
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
			localStorage.setItem(`queue/${state.library.selected}`, JSON.stringify([
				...state.queue.filter(
					// Remove the track from the queue
					(track) => track !== action.payload
				)
			]));

			return {
				...state,
				queue: [
					...state.queue.filter(
						// Remove the track from the queue
						(track) => track !== action.payload
					)
				]
			};

		case QUEUE_PUSH:
			localStorage.setItem(`queue/${state.library.selected}`, JSON.stringify([...state.queue, action.payload]));

			return {
				...state,
				queue: [...state.queue, action.payload]
			};

		case QUEUE_NEW:
			localStorage.setItem(`queue/${state.library.selected}`, JSON.stringify([...action.payload]));

			return {
				...state,
				queue: [...action.payload]
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
