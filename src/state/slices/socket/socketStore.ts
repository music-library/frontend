import Sarus from "@anephenix/sarus";

const socketUrl =
	import.meta.env.REACT_APP_WS ||
	`${(import.meta.env.REACT_APP_API || "https://not.a.real.domain")
		.replace("https", "wss")
		.replace("http", "ws")}/ws`;

export interface ISocketStore {
	connection: Sarus;
	global: {
		connectedUsers: number;
		sessions: Record<string, any>;
		playing: any[];
		messages: any[];
	};
	mimicUserSession: any;
}

export const socketStore: ISocketStore = {
	connection: new Sarus({
		url: socketUrl
	}),
	global: {
		connectedUsers: 0,
		sessions: {}, // { [userId]: { ...userSession } }
		playing: [],
		messages: []
	},
	mimicUserSession: null
};

export default socketStore;
