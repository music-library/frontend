import React from "react";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";

import { useAlbum, useAlbumTracks } from "catalog";

import Track from "./Track";

export function TrackAlbum({ album: suppliedAlbum, albumId }) {
	const libraryId = useSelector((state) => state.music.library.selected);
	const { data: queriedAlbum } = useAlbum(libraryId, albumId);
	const album = suppliedAlbum || queriedAlbum;
	const { data: tracks = [] } = useAlbumTracks(libraryId, album?.id);

	if (!album) {
		return (
			<div className="track-album loading">
				<h3><Skeleton width="80%" /></h3>
				{[...Array(4)].map((_, key) => <Skeleton className="track compact" key={key} />)}
			</div>
		);
	}

	return (
		<div className="track-album">
			<h3>{`${album.artist} - [${album.year}] ${album.title}`}</h3>
			{tracks.map((track) => <Track track={track} size="compact" key={track.id} />)}
		</div>
	);
}

export default TrackAlbum;
