import { parseJSON } from "utils";

export const FETCH_LIBRARY_START = "FETCH_LIBRARY_START";
export const FETCH_LIBRARY_SUCCESS = "FETCH_LIBRARY_SUCCESS";
export const FETCH_LIBRARY_FAILURE = "FETCH_LIBRARY_FAILURE";

export const TRACK_STAT_UPDATE = "TRACK_STAT_UPDATE";

export const QUEUE_REMOVE = "QUEUE_REMOVE";
export const QUEUE_PUSH = "QUEUE_PUSH";
export const QUEUE_NEW = "QUEUE_NEW";

export const UPDATE_USER_SEARCH = "UPDATE_USER_SEARCH";
export const FILTER_TOGGLE_TAG = "FILTER_TOGGLE_TAG";
export const FILTER_RESET_TAGS = "FILTER_RESET_TAGS";

// Initial state of app
const initialState = {
	didError: false,
	isFetching: true,
	library: {
		selected: parseJSON(localStorage.getItem("library_selected")) || "main",
		options: parseJSON(localStorage.getItem("library_options")) || [{
			"id": "main",
			"name": "Main"
		}],
	},
	queue: parseJSON(localStorage.getItem("queue")) || [], // [45, 49, 71, 94],
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
		case FETCH_LIBRARY_START:
			if (state.library.selected !== action.payload) {
				return {
					...initialState,
					queue: [],
				};
			}

			return {
				...initialState,
				queue: state.queue,
			};

		case FETCH_LIBRARY_SUCCESS:
			return {
				...state,
				tracks: action.payload?.tracks,
				tracksMap: action.payload?.tracks_map,
				albumsMap: action.payload?.albums,
				decades: action.payload?.decades,
				genres: action.payload?.genres,
			};

		case FETCH_LIBRARY_FAILURE:
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
			localStorage.setItem("queue", JSON.stringify([
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
			localStorage.setItem("queue", JSON.stringify([...state.queue, action.payload]));

			return {
				...state,
				queue: [...state.queue, action.payload]
			};

		case QUEUE_NEW:
			localStorage.setItem("queue", JSON.stringify([...action.payload]));

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
