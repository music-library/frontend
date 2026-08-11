import { orderBy } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import TrackBig from "./Tracks/TrackBig";

export function RecentlyListenedTracks() {
	// Get tracks from store
	const tracks = useSelector((state) => state.music.tracks);
	const [tracksToRender, setTracksToRender] = useState([]);

	// Find most recently listened to tracks
	// TODO: Make this more efficient (maybe get from API?)
	useEffect(() => {
		let stats = [];
		let numberOfTracks = 15;

		for (const i in tracks) {
			let lastPlayed = tracks?.[i]?.stats?.lastPlayed;

			// Convert unix milliseconds to seconds
			// prettier-ignore
			if (`${lastPlayed}`.length === 13) lastPlayed = Math.floor(lastPlayed / 1000);

			if (lastPlayed !== -1) {
				stats.push([i, lastPlayed]);
			}
		}

		stats = orderBy(stats, [1], ["desc", "asc"]);

		if (window.innerWidth < 1000) {
			numberOfTracks = 8;
		} else if (window.innerWidth < 1400) {
			numberOfTracks = 9;
		} else if (window.innerWidth < 1800) {
			numberOfTracks = 12;
		}

		setTracksToRender(stats.slice(0, numberOfTracks));
	}, [tracks]);

	return (
		<>
			{tracksToRender.length > 2 && (
				<div className="most-listened-tracks">
					<h2>Recently Played</h2>
					<div className="track-container grid grid-tracks-big">
						{tracksToRender.map((track, index) => {
							return (
								<TrackBig
									index={parseInt(track[0])}
									size="big"
									key={index}
								/>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
}

export default RecentlyListenedTracks;
