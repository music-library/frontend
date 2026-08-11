import { updateSlice } from "state/store";

/*
 * Socket: update connected users
 */
export const socketConnectedUserCount = (count: number) => {
	updateSlice("socket", (socket) => {
		socket.global.connectedUsers = count;
	});
};

/*
 * Socket: update global playing session
 */
export const socketGlobalPlaying = (playing) => {
	updateSlice("socket", (socket) => {
		socket.global.playing = playing;
	});
};

/*
 * Socket: update global playing session
 */
export const socketMimicUser = (usersSocketId) => {
	updateSlice("socket", (socket) => {
		socket.mimicUserSession = usersSocketId;
	});
};
