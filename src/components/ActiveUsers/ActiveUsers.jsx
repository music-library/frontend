import React from "react";
import cx from "classnames";
import { useSelector } from "react-redux";

import TrackBig from "../Tracks/TrackBig";
import ConnectedUsersCount from "./ConnectedUsersCount";

function ActiveUsers() {
    const tracksMap = useSelector((state) => state.music.tracksMap);
    const globalPlaying = useSelector((state) => state.socket.global.playing);

    return (
        <div className={cx("active-users")}>
            <h2>Active Users</h2>
            <p>
                There are currently <ConnectedUsersCount /> active users
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
