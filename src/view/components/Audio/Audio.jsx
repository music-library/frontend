import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isFirefox } from "lib/device";
import { api } from "lib/index";
import {
	muteVolume,
	pipToggle,
	playNextTrackBasedOnSession,
	playingTrackIsPaused,
	sessionUpdatePlayingStatus
} from "state/actions";

import Sound from "./Sound";

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 512;
const video = document.createElement("video");
video.muted = true;

export function Audio() {
	const dispatch = useDispatch();

	// Get session state from store
	const track = useSelector((state) => state.session.playing.track);
	const isPaused = useSelector((state) => state.session.playing.isPaused);
	const doesRepeat = useSelector((state) => state.session.actions.repeat);
	const volume = useSelector((state) => state.session.playing.status.volume);
	const isMute = useSelector((state) => state.session.playing.status.isMute);
	const showPip = useSelector((state) => state.session.actions.showPip);

	const handlePlayNextTrack = useCallback(() => {
		dispatch(playNextTrackBasedOnSession(true));
	}, [dispatch]);

	const handlePlayPreviousTrack = useCallback(() => {
		dispatch(playNextTrackBasedOnSession(false));
	}, [dispatch]);

	const handlePlaying = useCallback(
		(audio) => {
			dispatch(
				sessionUpdatePlayingStatus({
					duration: audio.duration,
					position: audio.time
				})
			);
		},
		[dispatch]
	);

	const handleTrackPause = useCallback(() => {
		dispatch(playingTrackIsPaused(true));
	}, [dispatch]);
	const handleTrackPlay = useCallback(() => {
		dispatch(playingTrackIsPaused(false));
	}, [dispatch]);

	const handleVolumeMuteToggle = useCallback(() => {
		if (isMute) {
			dispatch(muteVolume(false));
		} else {
			dispatch(muteVolume(true));
		}
	}, [dispatch, isMute]);

	const handlePictureInPicture = useCallback(async () => {
		try {
			if (
				document.pictureInPictureEnabled &&
				!video.disablePictureInPicture &&
				typeof track.id === "string"
			) {
				if (isFirefox) {
					video.srcObject = canvas.mozCaptureStream();
				} else {
					video.srcObject = canvas.captureStream();
				}
				const image = new Image();
				image.crossOrigin = true;
				image.src = [...navigator.mediaSession.metadata.artwork].pop().src;
				await image.decode();

				canvas.getContext("2d").drawImage(image, 0, 0, 512, 512);
				await video.play();
				await video.requestPictureInPicture();
			}
		} catch (err) {
			console.error(err);
		}
	}, [track.id]);

	const handleKeyupToPause = useCallback(
		(e) => {
			// Skip if user is typing in the search-bar
			if (e.target.tagName !== "INPUT") {
				// Space = play/pause
				if (e.code === "Space") {
					e.preventDefault();
					if (isPaused) {
						handleTrackPlay();
					} else {
						handleTrackPause();
					}
				}

				// ">" = next track
				if (e.code === "Period") {
					e.preventDefault();
					handlePlayNextTrack();
				}

				// "<" = previous track
				if (e.code === "Comma") {
					e.preventDefault();
					handlePlayPreviousTrack();
				}

				// "m" = mute/unmute track
				if (e.code === "KeyM") {
					e.preventDefault();
					handleVolumeMuteToggle();
				}

				// "p" = PIP, picture-in-picture
				if (e.code === "KeyP") {
					e.preventDefault();
					dispatch(pipToggle());
				}

				// // "-" = decrease volume
				// if (e.code === "Minus") {
				//     e.preventDefault();
				//     let newVolume = volume - 10;
				//     if (newVolume < 0) newVolume = 0;
				//     dispatch(changeVolume(newVolume));
				// }

				// // "+" = increase volume
				// if (e.code === "Equal") {
				//     e.preventDefault();
				//     let newVolume = volume + 10;
				//     if (newVolume > 100) newVolume = 100;
				//     dispatch(changeVolume(newVolume));
				// }
			}
		},
		[
			dispatch,
			handlePlayNextTrack,
			handlePlayPreviousTrack,
			handleTrackPause,
			handleTrackPlay,
			handleVolumeMuteToggle,
			isPaused
		]
	);

	// Keyup listener to play/pause track
	useEffect(() => {
		window.addEventListener("keydown", handleKeyupToPause);

		return () => {
			window.removeEventListener("keydown", handleKeyupToPause);
		};
	}, [handleKeyupToPause]);

	// MediaMetadata audio API
	useEffect(() => {
		if (!("mediaSession" in navigator)) return undefined;

		if (typeof track.id === "string") {
			navigator.mediaSession.metadata = new window.MediaMetadata({
				title: track.metadata.title,
				artist: track.metadata.artist,
				album: track.metadata.album,
				artwork: [
					{
						src: api().getUri({
							url: `/tracks/${track.id}/cover/96`
						}),
						sizes: "96x96",
						type: "image/jpeg"
					},
					{
						src: api().getUri({
							url: `/tracks/${track.id}/cover/192`
						}),
						sizes: "192x192",
						type: "image/jpeg"
					},
					{
						src: api().getUri({
							url: `/tracks/${track.id}/cover/256`
						}),
						sizes: "256x256",
						type: "image/jpeg"
					},
					{
						src: api().getUri({
							url: `/tracks/${track.id}/cover/512`
						}),
						sizes: "512x512",
						type: "image/jpeg"
					},
					{
						src: api().getUri({
							url: `/tracks/${track.id}/cover/1024`
						}),
						sizes: "1024x1024",
						type: "image/jpeg"
					}
				]
			});

			try {
				navigator.mediaSession.setActionHandler("nexttrack", handlePlayNextTrack);
				navigator.mediaSession.setActionHandler(
					"previoustrack",
					handlePlayPreviousTrack
				);
			} catch (error) {
				console.warn("Unable to register Media Session track handlers", error);
			}
		} else {
			navigator.mediaSession.metadata = null;
			navigator.mediaSession.playbackState = "none";
		}

		return () => {
			try {
				navigator.mediaSession.setActionHandler("nexttrack", null);
				navigator.mediaSession.setActionHandler("previoustrack", null);
			} catch (error) {
				console.warn("Unable to clear Media Session track handlers", error);
			}
		};
	}, [handlePlayNextTrack, handlePlayPreviousTrack, track]);

	useEffect(() => {
		// PIP, picture-in-picture
		if (showPip) {
			void handlePictureInPicture();
		} else {
			if (document.pictureInPictureElement) void document.exitPictureInPicture();
		}
	}, [handlePictureInPicture, showPip]);

	return (
		<>
			{typeof track.id === "string" && (
				<Sound
					track={track}
					isPaused={isPaused}
					loop={doesRepeat}
					volume={isMute ? 0 : volume}
					onPlaying={handlePlaying}
					onFinishedPlaying={handlePlayNextTrack}
				/>
			)}
		</>
	);
}

export default Audio;
