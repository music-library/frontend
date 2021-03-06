import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    playNextTrackBasedOnSession,
    playingTrackIsPaused,
    playingTrackDidError,
    sessionUpdatePlayingStatus
} from "../../store/actionCreators";

import Sound from "react-sound";

function Audio() {
    const dispatch = useDispatch();

    // Get session state from store
    const track = useSelector((state) => state.session.playing.track);
    const isPaused = useSelector((state) => state.session.playing.isPaused);
    const playingIndex = useSelector((state) => state.session.playing.index);
    const volume = useSelector((state) => state.session.playing.status.volume);
    const doesRepeat = useSelector((state) => state.session.actions.repeat);

    const handlePlayNextTrack = () => {
        dispatch(playNextTrackBasedOnSession(true));
    };

    const handlePlayPreviousTrack = () => {
        dispatch(playNextTrackBasedOnSession(false));
    };

    const handlePlaying = (audio) => {
        dispatch(sessionUpdatePlayingStatus({
            duration: audio.duration,
            position: audio.position,
        }));
    }

    const handleTrackPause = () => {
        dispatch(playingTrackIsPaused(true));
    }
    const handleTrackPlay = () => {
        dispatch(playingTrackIsPaused(false));
    }

    const handleDidError = (error) => {
        // Attempt to re-play
        const audioElement = window.soundManager.sounds[window.soundManager.soundIDs[0]]._a;
        const promise = audioElement.play();

        if (promise !== undefined) {
            promise.catch(error => {
                dispatch(playingTrackDidError());
                dispatch(playingTrackIsPaused(true));
            }).then(() => {
                dispatch(playingTrackIsPaused(false));
            });
        } else {
            dispatch(playingTrackDidError());
        }
    }

    const handleKeyupToPause = (e) => {
        if (e.code === "Space" && e.target.tagName !== "INPUT") {
            e.preventDefault();
            if (isPaused) { handleTrackPlay() }
            else { handleTrackPause() }
        }
    }

    // Keyup listener to play/pause track
    useEffect(() => {
        window.addEventListener("keydown", handleKeyupToPause);

        return () => {
            window.removeEventListener("keydown", handleKeyupToPause);
        };
    }, [handleKeyupToPause])

    // MediaMetadata audio API
    useEffect(() => {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: track.metadata.title,
                artist: track.metadata.artist,
                album: track.metadata.album,
                artwork: [
                    {
                        src: `${process.env.REACT_APP_API}/tracks/${track.id}/cover/96`,
                        sizes: "96x96",
                        type: "image/jpeg",
                    },
                    {
                        src: `${process.env.REACT_APP_API}/tracks/${track.id}/cover/192`,
                        sizes: "192x192",
                        type: "image/jpeg",
                    },
                    {
                        src: `${process.env.REACT_APP_API}/tracks/${track.id}/cover/256`,
                        sizes: "256x256",
                        type: "image/jpeg",
                    },
                    {
                        src: `${process.env.REACT_APP_API}/tracks/${track.id}/cover/512`,
                        sizes: "512x512",
                        type: "image/jpeg",
                    },
                    {
                        src: `${process.env.REACT_APP_API}/tracks/${track.id}/cover/1024`,
                        sizes: "1024x1024",
                        type: "image/jpeg",
                    },
                ],
            });

            navigator.mediaSession.setActionHandler(
                "nexttrack", handlePlayNextTrack
            );
            navigator.mediaSession.setActionHandler(
                "previoustrack", handlePlayPreviousTrack
            );

            navigator.mediaSession.setActionHandler(
                "pause",
                handleTrackPause
            );
            navigator.mediaSession.setActionHandler(
                "play",
                handleTrackPlay
            );
        }
    }, [
        dispatch,
        playingIndex,
        track,
    ]);

    return (
        <>
            {typeof track.id === "string" && (
                <Sound
                    url={`${process.env.REACT_APP_API}/tracks/${track.id}/audio`}
                    playStatus={
                        isPaused
                            ? Sound.status.PAUSED
                            : Sound.status.PLAYING
                    }
                    loop={doesRepeat}
                    volume={volume}
                    onPlaying={handlePlaying}
                    onFinishedPlaying={handlePlayNextTrack}
                    onError={handleDidError}
                />
            )}
        </>
    );

    // <Sound
    //   url="cool_sound.mp3"
    //   playStatus={Sound.status.PLAYING}
    //   volume={100}
    //   onError={() => {}}
    //   onLoading={this.handleSongLoading}
    //   onPlaying={this.handleSongPlaying}
    //   onFinishedPlaying={this.handleSongFinishedPlaying}
    // />
}

export default Audio;
