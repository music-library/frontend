import * as types from "./socketReducer";

/*
 * Socket: update connected users
 */
export const socketConnectedUserCount = (count) => (dispatch) => {
	dispatch({ type: types.SOCKET_CONNECTED_USERS, payload: count });
};

/*
 * Socket: update global playing session
 */
export const socketGlobalPlaying = (playing) => (dispatch) => {
	dispatch({ type: types.SOCKET_GLOBAL_PLAYING, payload: playing });
};

/*
 * Socket: update global playing session
 */
export const socketMimicUser = (usersSocketId) => (dispatch) => {
	dispatch({ type: types.SOCKET_MIMIC_USER, payload: usersSocketId });
};
