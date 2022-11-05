import { SOCKET_CONNECTED_USERS, SOCKET_GLOBAL_PLAYING } from "./socketReducer";

/*
 * Socket: update connected users
 */
export const socketConnectedUserCount = (count) => (dispatch) => {
	dispatch({ type: SOCKET_CONNECTED_USERS, payload: count });
};

/*
 * Socket: update global playing session
 */
export const socketGlobalPlaying = (playing) => (dispatch) => {
	dispatch({ type: SOCKET_GLOBAL_PLAYING, payload: playing });
};
