import socketIOClient from "socket.io-client";

export const SOCKET_CONNECTED_USERS = "SOCKET_CONNECTED_USERS";
export const SOCKET_GLOBAL_PLAYING = "SOCKET_GLOBAL_PLAYING";

// Initial state of app
const initialState = {
	connection: socketIOClient(`${import.meta.env.REACT_APP_API}`, {
		transports: ["websocket"]
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
