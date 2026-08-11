import React from "react";
import { useSelector } from "react-redux";

import { usePopularTracks } from "catalog";

import TrackBig from "./Tracks/TrackBig";

const visibleTrackCount = () => {
	if (window.innerWidth < 1000) return 8;
	if (window.innerWidth < 1400) return 9;
	if (window.innerWidth < 1800) return 12;
	return 15;
};

export function PopularTracks() {
	const libraryId = useSelector((state) => state.music.library.selected);
	const { data: tracks = [] } = usePopularTracks(libraryId, visibleTrackCount());

	if (tracks.length <= 2) return null;
	return (
		<div className="popular-tracks">
			<h2>Popular Tracks</h2>
			<div className="track-container grid grid-tracks-big">
				{tracks.map((track) => <TrackBig track={track} size="big" key={track.id} />)}
			</div>
		</div>
	);
}

export default PopularTracks;
