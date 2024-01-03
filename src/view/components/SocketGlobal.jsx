import React, { useEffect } from "react";

import { useDispatch, useSelector } from "lib/hooks";
import { socketEventParse } from "lib/index";
import { socketConnectedUserCount, socketGlobalPlaying } from "state/actions";

export function SocketGlobal() {
	const dispatch = useDispatch();
	const socket = useSelector((state) => state.socket.connection);

	useEffect(() => {
		const onMessage = (data) => {
			const event = socketEventParse(data);
			if (!event?.type) return;

			debug(event);

			switch (event.type) {
				case "ws:connectionCount":
					dispatch(socketConnectedUserCount(event.data));
					break;
				case "music:playingTracks":
					dispatch(socketGlobalPlaying(event.data));
					break;
				default:
					break;
			}
		};

		socket.on("message", onMessage);

		return () => {
			socket.off("message", onMessage);
		};
	}, [dispatch, socket]);

	return <></>;
}

export default SocketGlobal;
