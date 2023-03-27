import React, { useEffect } from "react";

import { socketParseEvent } from "utils";
import { useDispatch, useSelector } from "hooks";
import { socketConnectedUserCount, socketGlobalPlaying } from "store/actions";

function SocketGlobal() {
    const dispatch = useDispatch();
    const socket = useSelector((state) => state.socket.connection);

    useEffect(() => {
        const onMessage = (data) => {
            const event = socketParseEvent(data);
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
