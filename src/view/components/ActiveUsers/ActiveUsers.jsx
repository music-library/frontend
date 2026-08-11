import cx from "classnames";
import React from "react";
import { useSelector } from "react-redux";

import TrackBig from "../Tracks/TrackBig";
import ConnectedUsersCount from "./ConnectedUsersCount";

export function ActiveUsers() {
	const globalPlaying = useSelector((state) => state.socket.global.playing);

	return (
		<div className={cx("active-users")}>
			<h2>Active Users</h2>
			<p>
				There are currently <ConnectedUsersCount /> active users
			</p>

			<div className="track-container grid grid-tracks-big">
				{globalPlaying.map((trackId, index) => {
					return <TrackBig trackId={trackId} size="big" hideIfNonExistent key={`${trackId}:${index}`} />;
				})}
			</div>
		</div>
	);
}

export default ActiveUsers;
