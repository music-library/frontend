import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { socketConnectedUserCount, socketGlobalPlaying } from "store/actions";

function SocketGlobal() {
    const dispatch = useDispatch();

    const library = useSelector((state) => state.music.library);
    const socket = useSelector((state) => state.socket.connection);
    const playingId = useSelector((state) => state.session.playing.track.id);

    useEffect(() => {
        socket.on("message", (data) => {
            const event = socketParseEvent(data);
            if (!event?.type) return;

            debug({ event });

            switch (event.type) {
                case "ws:connectionCount":
                    dispatch(socketConnectedUserCount(event.data));
                    break;
                case "music:global:tracksPlaying":
                    dispatch(socketGlobalPlaying(event.data));
                    break;
                default:
                    break;
            }
        });
    }, [dispatch, socket]);

    // Send currently playing track
    useEffect(() => {
        socket.send(
            socketSendEvent("music:playTrack", {
                trackId: playingId
            })
        );
    }, [socket, playingId]);

    return <></>;
}

const socketSendEvent = (type, data) => {
    return JSON.stringify({
        type,
        data
    });
};

const socketParseEvent = (data) => {
    if (!data?.data) return {};
    return JSON.parse(data?.data);
};

export default SocketGlobal;
