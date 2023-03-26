import React from "react";
import { useSelector } from "react-redux";

import TrackBig from "./Tracks/TrackBig";

function ActiveUsers(props) {
    const tracksMap = useSelector((state) => state.music.tracksMap);

    const users = useSelector((state) => state.socket.global.connectedUsers);
    const globalPlaying = useSelector((state) => state.socket.global.playing);

    if (users <= 1) return null; // Hide if only one user is connected

    return (
        <div className="active-users">
            <h2>Active Users</h2>
            <p>
                There are currently <strong>{users}</strong> active users
            </p>

            <div className="track-container grid grid-tracks-big">
                {globalPlaying.map((trackId, index) => {
                    const trackIndex = tracksMap?.[trackId];
                    if (trackIndex == null) return null;

                    return (
                        <TrackBig index={trackIndex} size="big" key={index} />
                    );
                })}
            </div>
        </div>
    );
}

export default ActiveUsers;
