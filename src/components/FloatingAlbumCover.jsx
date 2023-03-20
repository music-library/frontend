import React from "react";
import sha1 from "crypto-js/sha1";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useSelector, useDispatch } from "react-redux";

import { api } from "utils";
import { useColor } from "hooks";
import { playingTrackIsPaused } from "store/actions";

import Image from "./Image";
import { Icon } from "components/Icon";

function FloatingAlbumCover() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Track and session data from store
    const playingIndex = useSelector((state) => state.session.playing.index);
    const track = useSelector((state) => state.music.tracks?.[playingIndex]);
    const isPaused = useSelector((state) => state.session.playing.isPaused);

    const color = useColor();

    // Album cover ID
    // Fallback to example image if no track is playing
    let albumCoverId = "example";
    if (track) albumCoverId = track.id;

    // Goto album of playing track
    const handleGoToAlbum = (e) => {
        e.stopPropagation();
        if (track) {
            const albumId = sha1(
                track.metadata.album + track.metadata.album_artist
            ).toString();
            navigate("/albums/" + albumId);
        }
    };

    // Play/Pause track
    const handlePause = (e) => {
        e.stopPropagation();
        dispatch(playingTrackIsPaused(!isPaused));
    };

    const styles = useSpring({
        from: { height: 0, opacity: 0 },
        to: { height: track ? 200 : 0, opacity: track ? 1 : 0 }
    });

    return (
        <animated.div
            className={`floating-album-cover${
                track && isPaused ? " isPaused" : ""
            }${isMobile ? " isMobile" : ""}${track ? "" : " notrack"}`}
            style={styles}
            onClick={handleGoToAlbum}
        >
            <Image
                src={api().getUri({ url: `/tracks/${albumCoverId}/cover/400` })}
                fallback={`fallback--album-cover`}
                alt="album-cover"
                draggable="false"
            />
            <div className="icon" onClick={handlePause}>
                {isPaused ? (
                    <Icon name="play" fill={color} />
                ) : (
                    <Icon name="pause" fill={color} />
                )}
            </div>
        </animated.div>
    );
}

export default FloatingAlbumCover;
