import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
	getDistinctAlbumIds,
	useCatalogRefreshState,
	useLibraryAlbums,
	useLibraryTracks
} from "catalog";

import TrackAlbum from "../Tracks/TrackAlbum";

export function TrackList() {
	const libraryId = useSelector((state) => state.music.library.selected);
	const filter = useSelector((state) => state.music.filter);
	const { data: tracks = [], isLoading } = useLibraryTracks(libraryId, {
		tags: filter.tags,
		search: filter.search,
		includeSearch: true
	});
	const { data: albums = [] } = useLibraryAlbums(libraryId);
	const refresh = useCatalogRefreshState(libraryId);
	const albumsById = useMemo(() => new Map(albums.map((album) => [album.id, album])), [albums]);
	const albumIds = useMemo(() => getDistinctAlbumIds(tracks), [tracks]);
	const showLoading = (isLoading || refresh.isRefreshing || refresh.didError) && albums.length === 0;
	const defaultRenderAmount = 12;
	const [renderedAlbumsCount, setRenderedAlbumsCount] = useState(defaultRenderAmount);

	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + window.scrollY >= document.body.offsetHeight - (window.innerHeight + 600)) {
				setRenderedAlbumsCount((count) => Math.min(albumIds.length, count + 4));
			} else if (window.scrollY <= 100) {
				setRenderedAlbumsCount(defaultRenderAmount);
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [albumIds.length]);

	return (
		<div className={`track-container${showLoading && refresh.didError ? " error" : ""}`}>
			{showLoading && [...Array(4)].map((_, key) => <TrackAlbum key={key} />)}
			{albumIds.slice(0, renderedAlbumsCount).map((albumId) => (
				<TrackAlbum album={albumsById.get(albumId)} albumId={albumId} key={albumId} />
			))}
		</div>
	);
}

export default TrackList;
