import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { filterTracks, groupTracksIntoAlbums, nRowsOfAlbums } from "lib/index";

import Album from "../Tracks/Album";

export function AlbumList() {
	// Get album list from store
	const tracks = useSelector((state) => state.music.tracks);
	const filter = useSelector((state) => state.music.filter);
	const filteredData = useSelector((state) => state.music.filteredData);
	const albumsMap = useSelector((state) => state.music.albumsMap);
	const isLoading = tracks.isFetching || tracks.didError;

	// Use pre-filtered tracks.data if tags applied
	let tracksData = tracks;
	if (filter.tags.length > 0) tracksData = filteredData;

	// #1 Filter tracks using tags or search input
	const tracksFiltered = filterTracks(tracks, tracksData, filter, true);

	// #2 Populate albums from filtered array
	// #3 Create array of Album components to render
	const albumsBeingRendered = groupTracksIntoAlbums(tracksFiltered).map(
		(albumId, key) => {
			return (
				<Album albumId={albumId} albumTracks={albumsMap?.[albumId]} key={key} />
			);
		}
	);

	// # of rendered albums
	const defaultRenderAmmount = nRowsOfAlbums(4);
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
					setRenderedAlbumsCount(renderedAlbumsCount + nRowsOfAlbums(4));
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
		<div className="track-container grid grid-albums">
			{isLoading &&
				[...Array(nRowsOfAlbums(4))].map((x, key) => <Album key={key} />)}

			{albumsBeingRendered.slice(0, renderedAlbumsCount)}
		</div>
	);
}

export default AlbumList;
