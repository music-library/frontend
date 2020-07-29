import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import sha1 from "crypto-js/sha1";

import {
    playNextTrackBasedOnSession,
    playingTrackIsPaused,
    playingTrackDidError,
    shuffleToggle,
    repeatToggle,
    changeVolume,
} from "../store/actionCreators";

import Icon from "./Icon";
import Image from "./Image";
import AudioPositionElement from "./AudioPositionElement";

function AudioControlBar() {
    const dispatch = useDispatch();
    const history = useHistory();

    // Get session state from store
    const playingIndex = useSelector((state) => state.session.playing.index);
    const track = useSelector((state) => state.music.tracks.data[playingIndex]);
    const isPaused = useSelector((state) => state.session.playing.isPaused);
    const doesShuffle = useSelector((state) => state.session.actions.shuffle);
    const doesRepeat = useSelector((state) => state.session.actions.repeat);
    const volume = useSelector((state) => state.session.playing.status.volume);

    // Album cover ID
    // Fallback to example image if no track is playing
    let albumCoverId = "example";
    if (track) albumCoverId = track.id;

    // Play/Pause track
    const handlePause = (e) => {
        e.stopPropagation();
        dispatch(
            playingTrackIsPaused(!isPaused)
        );
    };

    // Goto album of playing track
    const handleGoToAlbum = (e) => {
        e.stopPropagation();
        if (track) {
            const albumId = sha1(track.metadata.album + track.metadata.album_artist).toString();
            history.push("/albums/" + albumId);
        }
    };

    const handlePlayNextTrack = () => {
        dispatch(playNextTrackBasedOnSession(true));
    };

    const handlePlayPreviousTrack = () => {
        dispatch(playNextTrackBasedOnSession(false));
    };

    const handleVolumeChange = (e) => {
        dispatch(changeVolume(e.target.value));
    }

    const handleShuffleToggle = () => dispatch(shuffleToggle());
    const handleRepeatToggle = () => dispatch(repeatToggle());


    const styles = useSpring({
        from: {height: 0, opacity: 0},
        to: {height: track ? 70 : 0, opacity: track ? 1 : 0}
    });

    return (
            <animated.div className="audio-control-bar" style={styles}>
                <div className="audio-control-bar-content container">
                    <div className="track col" onClick={handleGoToAlbum}>
                        <div className="track-cover">
                            <Image
                                src={`${process.env.REACT_APP_API}/tracks/${albumCoverId}/cover/400`}
                                fallback={`fallback--album-cover`}
                                alt="album-cover"
                                draggable="false"
                            />
                        </div>
                        <div className="track-metadata">
                            {track ? track.metadata.title : "~"}
                            <div className="artist">
                                {track ? track.metadata.artist : "~"}
                            </div>
                        </div>
                    </div>
                    <div className="controls col">
                        <div className={`icon${doesShuffle ? " active" : ""}`} onClick={handleShuffleToggle}>
                            <Icon name="shuffle" />
                        </div>
                        <span className="divider"></span>
                        <div className="icon" onClick={handlePlayPreviousTrack}>
                            <Icon name="skip-previous" />
                        </div>
                        <div className={`icon${isPaused ? " active" : ""}`} onClick={handlePause}>
                            {
                                isPaused ?
                                <Icon name="play" /> :
                                <Icon name="pause" />
                            }
                        </div>
                        <div className="icon" onClick={handlePlayNextTrack}>
                            <Icon name="skip-next" />
                        </div>
                        <span className="divider"></span>
                        <div className={`icon${doesRepeat ? " active" : ""}`} onClick={handleRepeatToggle}>
                            <Icon name="replay" />
                        </div>
                    </div>
                    <div className="volume col">
                        <Icon name="volume-high" />
                        <input type="range" min="0" max="100" onChange={handleVolumeChange} />
                    </div>
                    <AudioPositionElement />
                </div>
            </animated.div>
    );
}

export default AudioControlBar;
