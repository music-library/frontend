import { parseJSON } from "lib/strings";

export const LIBRARY_SWITCH = "LIBRARY_SWITCH";
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

const initialState = {
	library: {
		selected: initialSelectedLibrary
	},
	queue: getQueue(initialSelectedLibrary),
	filter: {
		tags: [],
		search: ""
	}
};

const musicReducer = (state = initialState, action) => {
	switch (action.type) {
		case LIBRARY_SWITCH: {
			if (state.library.selected === action.payload) return state;
			localStorage.setItem("library/selected", action.payload);
			return {
				...state,
				library: { selected: action.payload },
				queue: getQueue(action.payload),
				filter: { tags: [], search: "" }
			};
		}

		case QUEUE_REMOVE: {
			const queue = state.queue.filter((trackId) => trackId !== action.payload);
			persistQueue(state.library.selected, queue);
			return { ...state, queue };
		}

		case QUEUE_PUSH: {
			const queue = [...state.queue, action.payload];
			persistQueue(state.library.selected, queue);
			return { ...state, queue };
		}

		case QUEUE_NEW: {
			const queue = action.payload.filter(isTrackId);
			persistQueue(state.library.selected, queue);
			return { ...state, queue };
		}

		case UPDATE_USER_SEARCH:
			return {
				...state,
				filter: { ...state.filter, search: action.payload }
			};

		case FILTER_TOGGLE_TAG: {
			const tags = state.filter.tags.includes(action.payload)
				? state.filter.tags.filter((tag) => tag !== action.payload)
				: [...state.filter.tags, action.payload];
			return { ...state, filter: { ...state.filter, tags } };
		}

		case FILTER_RESET_TAGS:
			return { ...state, filter: { ...state.filter, tags: [] } };

		default:
			return state;
	}
};

export default musicReducer;
