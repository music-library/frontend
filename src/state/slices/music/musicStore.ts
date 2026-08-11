import { parseJSON } from "lib/strings";

const initialSelectedLibrary = localStorage.getItem("library/selected") || "main";
export const getQueueStorageKey = (library) => `queue/v2/${library}`;
export const isTrackId = (trackId) => typeof trackId === "string" && trackId.length > 0;
export const getQueue = (library = initialSelectedLibrary) => {
	const queue = parseJSON(localStorage.getItem(getQueueStorageKey(library)));
	return Array.isArray(queue) ? queue.filter(isTrackId) : [];
};
export const persistQueue = (library, queue) => {
	localStorage.setItem(getQueueStorageKey(library), JSON.stringify(queue));
};

export interface IMusicStore {
	didError: boolean;
	isFetching: boolean;
	library: {
		selected: string;
		options: {
			id: string;
			name: string;
		}[];
	};
	queue: string[];
	filter: {
		tags: string[];
		search: string;
	};
	filteredData: string[];
	tracks: any[];
	tracksMap: Record<string, any>;
	albumsMap: Record<string, any>;
	decades: string[];
	genres: string[];
}

export const musicStore: IMusicStore = {
	didError: false,
	isFetching: true,
	library: {
		selected: initialSelectedLibrary,
		options: parseJSON(localStorage.getItem("library/options")) || [
			{
				id: "main",
				name: "Main"
			}
		]
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
	genres: []
};

export default musicStore;
