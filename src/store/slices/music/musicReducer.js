import { parseJSON } from "utils";

export const FETCH_TRACKS_START = "FETCH_TRACKS_START";
export const FETCH_TRACKS_SUCCESS = "FETCH_TRACKS_SUCCESS";
export const FETCH_TRACKS_FAILURE = "FETCH_TRACKS_FAILURE";

export const QUEUE_REMOVE = "QUEUE_REMOVE";
export const QUEUE_PUSH = "QUEUE_PUSH";
export const QUEUE_NEW = "QUEUE_NEW";

export const UPDATE_USER_SEARCH = "UPDATE_USER_SEARCH";
export const FILTER_TOGGLE_TAG = "FILTER_TOGGLE_TAG";
export const FILTER_RESET_TAGS = "FILTER_RESET_TAGS";

// Initial state of app
const initialState = {
	tracks: {
		didError: false,
		isFetching: true,
		filter: {
			tags: [],
			search: ""
		},
		queue: parseJSON(localStorage.getItem("queue")) || [], //[45, 49, 71, 94],
		albumsData: [],
		filteredData: [],
		data: []
	}
};

const musicReducer = (state = initialState, action) => {
	switch (action.type) {
		case FETCH_TRACKS_START:
			return {
				...state,
				tracks: {
					...state.tracks,
					didError: false,
					isFetching: true,
					data: []
				}
			};

		case FETCH_TRACKS_SUCCESS:
			return {
				...state,
				tracks: {
					...state.tracks,
					isFetching: false,
					albumsData: action.payload[1],
					data: action.payload[0]
				}
			};

		case FETCH_TRACKS_FAILURE:
			return {
				...state,
				tracks: {
					...state.tracks,
					didError: true,
					isFetching: false
				}
			};

		case QUEUE_REMOVE:
			localStorage.setItem("queue", JSON.stringify([
				...state.tracks.queue.filter(
					// Remove the track from the queue
					(track) => track !== action.payload
				)
			]));

			return {
				...state,
				tracks: {
					...state.tracks,
					queue: [
						...state.tracks.queue.filter(
							// Remove the track from the queue
							(track) => track !== action.payload
						)
					]
				}
			};

		case QUEUE_PUSH:
			localStorage.setItem("queue", JSON.stringify([...state.tracks.queue, action.payload]));

			return {
				...state,
				tracks: {
					...state.tracks,
					queue: [...state.tracks.queue, action.payload]
				}
			};

		case QUEUE_NEW:
			localStorage.setItem("queue", JSON.stringify([...action.payload]));

			return {
				...state,
				tracks: {
					...state.tracks,
					queue: [...action.payload]
				}
			};

		case UPDATE_USER_SEARCH:
			return {
				...state,
				tracks: {
					...state.tracks,
					filter: {
						...state.tracks.filter,
						search: action.payload
					}
				}
			};

		case FILTER_TOGGLE_TAG:
			return {
				...state,
				tracks: {
					...state.tracks,
					filter: {
						...state.tracks.filter,
						tags: action.payload.tags
					},
					filteredData: action.payload.filteredData
				}
			};

		case FILTER_RESET_TAGS:
			return {
				...state,
				tracks: {
					...state.tracks,
					filter: {
						...state.tracks.filter,
						tags: []
					},
					filteredData: []
				}
			};

		default:
			return state;
	}
};

export default musicReducer;
