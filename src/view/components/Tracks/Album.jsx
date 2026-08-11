import React from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useAlbum, useTrack } from "catalog";
import { useColor } from "lib/hooks";
import { api } from "lib/index";
import { playTrack, playingTrackIsPaused } from "state/actions";

import { Icon, Image } from "view/components";

export function Album({ album: suppliedAlbum, albumId, onNavigate }) {
	const dispatch = useDispatch();
	const color = useColor();
	const libraryId = useSelector((state) => state.music.library.selected);
	const { data: queriedAlbum } = useAlbum(libraryId, albumId);
	const album = suppliedAlbum || queriedAlbum;
	const playingTrackId = useSelector((state) => state.session.playing.trackId);
	const { data: playingTrack } = useTrack(libraryId, playingTrackId);
	const isPaused = useSelector((state) => state.session.playing.isPaused);
	const isAlbumPlaying = album?.id === playingTrack?.albumId;

	const handleAlbumClick = (event) => {
		if (!album) {
			event.preventDefault();
			return;
		}
		if (event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey) {
			onNavigate?.();
		}
	};

	const handleActionButton = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (!album) return;
		if (!isAlbumPlaying) dispatch(playTrack(album.coverTrackId));
		else dispatch(playingTrackIsPaused(!isPaused));
	};

	return (
		<Link to={album ? `/albums/${album.id}` : "#"} onClick={handleAlbumClick}>
			<div className={`album${isAlbumPlaying ? " playing" : ""}${album ? "" : " loading"}`}>
				<div className="album-cover">
					<Image
						src={api().getUri({ url: `/tracks/${album?.coverTrackId || "example"}/cover/600` })}
						fallback="fallback--album-cover"
						alt="album-cover"
						draggable="false"
					/>
					<div className="album-action" onClick={handleActionButton} style={{ opacity: isMobile && 1 }}>
						<div className="album-action-button">
							{!isAlbumPlaying || isPaused ? (
								<Icon name="play" fill={isAlbumPlaying && isPaused ? color : "#fff"} />
							) : (
								<Icon name="pause" fill={color} />
							)}
						</div>
					</div>
				</div>
				<div className="album-metadata">
					<div className="album-metadata-album"><p>{album?.title || <Skeleton width="88%" />}</p></div>
					<div className="album-metadata-artist"><p>{album?.artist || <Skeleton width="60%" />}</p></div>
				</div>
			</div>
		</Link>
	);
}

export default Album;
