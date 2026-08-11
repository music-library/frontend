import { useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { useAlbum, useAlbumTracks, useCatalogRefreshState, useTrack } from "catalog";
import { useColor } from "lib/hooks";
import { api } from "lib/index";
import { playTrack, playingTrackIsPaused } from "state/actions";

import { Halo, Icon, Image, Ripple, Track } from "view/components";

export function AlbumIndividual() {
	const dispatch = useDispatch();
	const color = useColor();

	const $albumCover = useRef(null);
	const $albumSide = useRef(null);

	// Album ID in URL
	const { id } = useParams();

	const libraryId = useSelector((state) => state.music.library.selected);
	const { data: album } = useAlbum(libraryId, id);
	const { data: albumTracks = [], isLoading: tracksLoading } = useAlbumTracks(libraryId, id);
	const refresh = useCatalogRefreshState(libraryId);
	const isPaused = useSelector((state) => state.session.playing.isPaused);
	const playingTrackId = useSelector((state) => state.session.playing.trackId);
	const { data: playingTrack } = useTrack(libraryId, playingTrackId);

	// Is album playing
	let isAlbumPlaying = false;

	// Album exists
	if (album?.id && playingTrack?.albumId && album.id === playingTrack.albumId)
		isAlbumPlaying = true;

	//
	const isLoading = !album?.id || tracksLoading || (refresh.isRefreshing && albumTracks.length === 0);

	// Build external links
	let linkSearch = "";
	let linkGoogle = "https://www.google.com/search?q=";
	let linkYoutube = "https://www.youtube.com/results?search_query=";
	let linkDiscogs = "https://www.discogs.com/search/?q=";

	if (!isLoading) {
		// prettier-ignore
		linkSearch = `${album.artist} - ${album.title}`;
		linkSearch = encodeURIComponent(linkSearch).replace(/%20/g, "+");
	}

	// Action button handler
	const handleActionButton = (e) => {
		e.stopPropagation();
		if (album) {
			if (!isAlbumPlaying) {
				// Play first track in album
				dispatch(playTrack(album.coverTrackId));
			} else {
				// Pause track
				dispatch(playingTrackIsPaused(!isPaused));
			}
		}
	};

	// Create a floating album cover on scroll to keep the cover
	// in view if there are lots of tracks.
	const handleScroll = (e) => {
		if (isLoading || window.innerWidth < 1200) return false;

		if (window.scrollY > 100 && albumTracks.length >= 5) {
			$albumCover.current.style.position = "fixed";
			$albumCover.current.style.top = "100px";

			// Prevent album cover floating past tracks.
			// Calculate exactly where to stop album-cover - bottom of album-side.
			//
			// prettier-ignore
			let albumSideBottom = $albumSide.current.offsetTop + $albumSide.current.offsetHeight; // Side bottom position

			let albumCoverHeight = $albumCover.current.offsetHeight; // Cover height
			let albumCoverBottom =
				document.documentElement.scrollTop + 100 + albumCoverHeight; // Cover bottom position
			let albumCoverFinalPositionTop = albumSideBottom - albumCoverHeight;

			if (albumCoverBottom >= albumSideBottom) {
				$albumCover.current.style.position = "absolute";
				$albumCover.current.style.top = `${albumCoverFinalPositionTop}px`;
			}
		} else {
			$albumCover.current.style.position = "relative";
			$albumCover.current.style.top = "0px";
		}
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [isLoading]);

	// Jump to top of page
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<>
			<div className="AlbumIndividual container">
				<section>
					<div className="album">
						<div className="album-cover-wrapper">
							<div
								className="album-cover"
								onClick={handleActionButton}
								ref={$albumCover}
							>
								{isLoading ? (
									<Skeleton width={600} height={600} />
								) : (
									<Image
										src={
											isLoading
												? "example"
												: api().getUri({
												url: `/tracks/${album?.coverTrackId}/cover/600`
												  })
										}
										fallback={`fallback--album-cover`}
										alt="album-cover"
										draggable="false"
									/>
								)}
							</div>
						</div>

						<div className="album-side" ref={$albumSide}>
							<div className="album-metadata">
								<h2>
									{isLoading ? <Skeleton width={300} /> : album?.title}
								</h2>
								<p>
									{isLoading ? (
										<Skeleton width={200} />
									) : (
										<>
											<span
												style={{
													color: color
												}}
											>
											{album?.year}
											</span>
											{" - "}
										{album?.artist}
										</>
									)}
								</p>
							</div>

							<div className="album-links">
								<div className="album-links-link">
									<div
										className="album-links-link-background"
										style={{
											backgroundColor: color
										}}
									></div>
									<a
										href={`${linkGoogle}${linkSearch}`}
										target="_blank"
										// title="Search Google for this track"
									>
										<div>
											<Icon name="logo-google" />
										</div>
									</a>
								</div>

								<div className="album-links-link">
									<div
										className="album-links-link-background"
										style={{
											backgroundColor: color
										}}
									></div>
									<a
										href={`${linkYoutube}${linkSearch}`}
										target="_blank"
										// title="Search YouTube for this track"
									>
										<div>
											<Icon name="logo-youtube" />
										</div>
									</a>
								</div>

								<div className="album-links-link">
									<div
										className="album-links-link-background"
										style={{
											backgroundColor: color
										}}
									></div>
									<a
										href={`${linkDiscogs}${linkSearch}`}
										target="_blank"
										// title="Search Discogs for this track"
									>
										<div>
											<Icon name="logo-discogs-vinyl" />
										</div>
									</a>
								</div>
							</div>

							<div className="track-container">
								{isLoading &&
									[...Array(8)].map((x, key) => (
										<Skeleton
											width={"80%"}
											height={"60px"}
											enableAnimation={false}
											key={key}
										/>
									))}

								{!isLoading &&
									albumTracks.map((track, key) => {
										return (
											<Track
												track={track}
												trackNumber={key + 1}
												key={key}
											/>
										);
									})}
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}

export default AlbumIndividual;
