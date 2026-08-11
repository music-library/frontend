import React, { useEffect } from "react";

import { useSelector } from "lib/hooks";
import { socketEventParse } from "lib/index";
import { socketConnectedUserCount, socketGlobalPlaying } from "state/actions";

export function SocketGlobal() {
	const socket = useSelector((state) => state.socket.connection);

	useEffect(() => {
		const onMessage = (data) => {
			const event = socketEventParse(data);
			if (!event?.type) return;

			debug(event);

			switch (event.type) {
				case "ws:connectionCount":
					socketConnectedUserCount(event.data);
					break;
				case "music:playingTracks":
					socketGlobalPlaying(event.data);
					break;
				default:
					break;
			}
		};

		socket.on("message", onMessage);

		return () => {
			socket.off("message", onMessage);
		};
	}, [socket]);

	return <></>;
}

export default SocketGlobal;
