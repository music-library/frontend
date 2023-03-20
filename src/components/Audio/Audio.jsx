import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isFirefox } from "react-device-detect";

import { api } from "utils";

import {
    playNextTrackBasedOnSession,
    playingTrackIsPaused,
    playingTrackDidError,
    sessionUpdatePlayingStatus,
    changeVolume,
    muteVolume,
    pipToggle
} from "store/actions";

import Sound from "./Sound";

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 512;
const video = document.createElement("video");
video.muted = true;

function Audio() {
    const dispatch = useDispatch();

    // Get session state from store
    const track = useSelector((state) => state.session.playing.track);
    const isPaused = useSelector((state) => state.session.playing.isPaused);
    const playingIndex = useSelector((state) => state.session.playing.index);
    const doesRepeat = useSelector((state) => state.session.actions.repeat);
    const volume = useSelector((state) => state.session.playing.status.volume);
    const isMute = useSelector((state) => state.session.playing.status.isMute);
    const showPip = useSelector((state) => state.session.actions.showPip);

    const handlePlayNextTrack = () => {
        dispatch(playNextTrackBasedOnSession(true));
    };

    const handlePlayPreviousTrack = () => {
        dispatch(playNextTrackBasedOnSession(false));
    };

    const handlePlaying = (audio) => {
        dispatch(
            sessionUpdatePlayingStatus({
                duration: audio.duration,
                position: audio.time
            })
        );
    };

    const handleTrackPause = () => {
        dispatch(playingTrackIsPaused(true));
    };
    const handleTrackPlay = () => {
        dispatch(playingTrackIsPaused(false));
    };

    const handleVolumeMuteToggle = () => {
        if (isMute) {
            dispatch(muteVolume(false));
        } else {
            dispatch(muteVolume(true));
        }
    };

    const handleDidError = (error) => {
        dispatch(playingTrackDidError());
    };

    const handlePictureInPicture = async () => {
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
                image.src = [
                    ...navigator.mediaSession.metadata.artwork
                ].pop().src;
                await image.decode();

                canvas.getContext("2d").drawImage(image, 0, 0, 512, 512);
                await video.play();
                await video.requestPictureInPicture();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleKeyupToPause = (e) => {
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
    };

    // Keyup listener to play/pause track
    useEffect(() => {
        window.addEventListener("keydown", handleKeyupToPause);

        return () => {
            window.removeEventListener("keydown", handleKeyupToPause);
        };
    }, [handleKeyupToPause]);

    // MediaMetadata audio API
    useEffect(() => {
        if ("mediaSession" in navigator) {
            console.log(
                "api().getUri()",
                api().getUri({ url: `/tracks/${track.id}/cover/96` })
            );
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

            navigator.mediaSession.setActionHandler(
                "nexttrack",
                handlePlayNextTrack
            );
            navigator.mediaSession.setActionHandler(
                "previoustrack",
                handlePlayPreviousTrack
            );

            navigator.mediaSession.setActionHandler("pause", handleTrackPause);
            navigator.mediaSession.setActionHandler("play", handleTrackPlay);
        }

        // PIP, picture-in-picture
        if (showPip) {
            handlePictureInPicture();
        } else {
            if (document.pictureInPictureElement)
                document.exitPictureInPicture();
        }
    }, [dispatch, playingIndex, track, showPip]);

    return (
        <>
            {typeof track.id === "string" && (
                <Sound
                    track={track}
                    isPaused={isPaused}
                    loop={doesRepeat}
                    volume={isMute ? 0 : volume}
                    onError={handleDidError}
                    onPlaying={handlePlaying}
                    onFinishedPlaying={handlePlayNextTrack}
                />
            )}
        </>
    );
}

export default Audio;
