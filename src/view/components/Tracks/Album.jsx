import React from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useColor } from "lib/hooks";
import { api, getAlbum } from "lib/index";
import { playTrack, playingTrackIsPaused } from "state/actions";

import { Icon, Image } from "view/components";

export function Album({ albumId = false, albumTracks = [] }) {
	const dispatch = useDispatch();
	const color = useColor();

	const playingAlbum = useSelector((state) => state.session.playing.track.id_album);
	const isPaused = useSelector((state) => state.session.playing.isPaused);
	const tracksMap = useSelector((state) => state.music.tracksMap);

	// If api call failed
	const didError = useSelector((state) => state.music.didError);

	// Is album playing
	let isAlbumPlaying = false;

	// Assume loading state
	let isLoading = true;
	let albumName = <Skeleton width={"88%"} />;
	let albumArtist = <Skeleton width={"60%"} />;
	let albumCoverId = "example";

	// Album exists
	if (albumId && albumTracks.length > 0) {
		isLoading = false;
		const album = getAlbum(albumId);
		albumName = album?.album;
		albumArtist = album?.album_artist;
		albumCoverId = album?.idCover;
		if (albumId == playingAlbum) isAlbumPlaying = true;
	}

	// Goto album url
	const handleAlbumClick = (e) => {
		if (!albumId) e.preventDefault();
	};

	// Action button handler
	const handleActionButton = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isAlbumPlaying) {
			// Play first track in album
			dispatch(playTrack(tracksMap[albumTracks[0]]));
		} else {
			// Pause track
			dispatch(playingTrackIsPaused(!isPaused));
		}
	};

	// Dynamic class list
	let classList = "";
	classList += isAlbumPlaying ? " playing" : "";
	classList += isLoading ? " loading" : "";
	classList += didError ? " error" : "";

	return (
		<Link to={albumId ? `/albums/${albumId}` : `#`} onClick={handleAlbumClick}>
			<div className={`album${classList}`}>
				<div className="album-cover">
					<Image
						src={api().getUri({
							url: `/tracks/${albumCoverId}/cover/600`
						})}
						fallback={`fallback--album-cover`}
						alt="album-cover"
						draggable="false"
					/>
					<div
						className="album-action"
						onClick={handleActionButton}
						style={{ opacity: isMobile && 1 }}
					>
						<div className="album-action-button">
							{!isAlbumPlaying || isPaused ? (
								<Icon
									name="play"
									fill={isAlbumPlaying && isPaused ? color : "#fff"}
								/>
							) : (
								<Icon name="pause" fill={color} />
							)}
						</div>
					</div>
				</div>

				<div className="album-metadata">
					<div className="album-metadata-album">
						<p>{albumName}</p>
					</div>
					<div className="album-metadata-artist">
						<p>{albumArtist}</p>
					</div>
				</div>
			</div>
		</Link>
	);
}

export default Album;
