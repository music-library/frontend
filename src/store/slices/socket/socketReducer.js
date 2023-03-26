import Sarus from '@anephenix/sarus';

export const SOCKET_CONNECTED_USERS = "SOCKET_CONNECTED_USERS";
export const SOCKET_GLOBAL_PLAYING = "SOCKET_GLOBAL_PLAYING";

const socketUrl = import.meta.env.REACT_APP_WS || `${(import.meta.env.REACT_APP_API || "https://not.a.real.domain")
	.replace("https", "wss")
	.replace("http", "ws")}/ws`;

// Initial state of app
const initialState = {
	connection: new Sarus({
		url: socketUrl,
	}),
	global: {
		connectedUsers: 0,
		playing: [],
		messages: []
	}
};

const socketReducer = (state = initialState, action) => {
	switch (action.type) {
		case SOCKET_CONNECTED_USERS:
			return {
				...state,
				global: {
					...state.global,
					connectedUsers: action.payload
				}
			};

		case SOCKET_GLOBAL_PLAYING:
			return {
				...state,
				global: {
					...state.global,
					playing: action.payload
				}
			};

		default:
			return state;
	}
};

export default socketReducer;
