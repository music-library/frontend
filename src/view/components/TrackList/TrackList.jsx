import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { filterTracks, groupTracksIntoAlbums } from "lib/index";

import TrackAlbum from "../Tracks/TrackAlbum";

export function TrackList() {
	// Get album list from store
	const tracks = useSelector((state) => state.music.tracks);
	const filter = useSelector((state) => state.music.filter);
	const filteredData = useSelector((state) => state.music.filteredData);
	const albumsMap = useSelector((state) => state.music.albumsMap);
	const isLoading = tracks.isFetching || tracks.didError;

	// Use pre-filtered tracks.data if tags applied
	const tracksData = filter.tags.length > 0 ? filteredData : tracks;

	// #1 Filter tracks using tags or search input
	let tracksFiltered = filterTracks(tracks.data, tracksData, filter, true);

	// #2 Populate albums from filtered array
	// #3 Create array of Album components to render
	let albumsBeingRendered = groupTracksIntoAlbums(tracksFiltered).map(
		(albumId, key) => {
			return (
				<TrackAlbum
					key={albumId || key}
					albumId={albumId}
					albumTracks={albumsMap?.[albumId]}
				/>
			);
		}
	);

	// # of rendered albums
	const defaultRenderAmmount = 12;
	const [renderedAlbumsCount, setRenderedAlbumsCount] = useState(defaultRenderAmmount);

	useEffect(() => {
		// Adds more albums as user scrolls to bottom of page
		const handleScroll = () => {
			if (
				window.innerHeight + window.scrollY >=
				document.body.offsetHeight - (window.innerHeight + 600)
			) {
				if (renderedAlbumsCount < albumsBeingRendered.length) {
					// Add album to render
					setRenderedAlbumsCount(renderedAlbumsCount + 4);
				}
			} else if (window.scrollY <= 100) {
				// Reset render count
				setRenderedAlbumsCount(defaultRenderAmmount);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});

	return (
		<div className="track-container">
			{isLoading && [...Array(4)].map((x, key) => <TrackAlbum key={key} />)}

			{albumsBeingRendered.slice(0, renderedAlbumsCount)}
		</div>
	);
}

export default TrackList;
